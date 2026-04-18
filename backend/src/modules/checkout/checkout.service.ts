import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  FulfillmentStatus,
  OrderStatus,
  PaymentProviderKind,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import { CouponService } from '../coupons/coupon.service';
import { PaymentOrchestratorService } from '../payments/payment-orchestrator.service';
import { ShippingCalculatorService } from '../shipping/shipping-calculator.service';

const orderNumber = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12);

export type PlaceOrderInput = {
  userId: string;
  shippingAddressId: string;
  billingAddressId?: string;
  shippingMethodCode: string;
  couponCode?: string;
  paymentProvider: PaymentProviderKind;
  customerNote?: string;
};

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coupons: CouponService,
    private readonly shipping: ShippingCalculatorService,
    private readonly payments: PaymentOrchestratorService,
  ) {}

  async placeOrder(input: PlaceOrderInput) {
    const user = await this.prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new NotFoundException('User not found');

    const shippingAddr = await this.prisma.address.findFirst({
      where: { id: input.shippingAddressId, userId: input.userId },
    });
    if (!shippingAddr) throw new NotFoundException('Shipping address not found');

    const billingAddr = input.billingAddressId
      ? await this.prisma.address.findFirst({
          where: { id: input.billingAddressId, userId: input.userId },
        })
      : shippingAddr;
    if (!billingAddr) throw new NotFoundException('Billing address not found');

    const cart = await this.prisma.cart.findUnique({
      where: { userId: input.userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    categories: true,
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                  },
                },
                inventory: true,
                optionValues: { include: { optionValue: { include: { option: true } } } },
              },
            },
          },
        },
      },
    });
    if (!cart?.items.length) throw new BadRequestException('Cart is empty');

    let subtotal = new Prisma.Decimal(0);
    let totalWeight = 0;
    const productIds: string[] = [];
    const categoryIds = new Set<string>();

    for (const line of cart.items) {
      const v = line.variant;
      if (v.product.status !== 'ACTIVE') throw new BadRequestException(`Inactive product: ${v.product.name}`);
      if (v.trackInventory) {
        const onHand = v.inventory?.quantityOnHand ?? 0;
        if (onHand < line.quantity) {
          throw new BadRequestException(`Insufficient stock for ${v.sku}`);
        }
      }
      const lineTotal = new Prisma.Decimal(v.price).mul(line.quantity);
      subtotal = subtotal.add(lineTotal);
      productIds.push(v.productId);
      v.product.categories.forEach((c) => categoryIds.add(c.categoryId));
      totalWeight += (v.weightGrams ?? 0) * line.quantity;
    }

    let discountTotal = new Prisma.Decimal(0);
    let couponId: string | null = null;
    let couponCodeSnapshot: string | null = null;
    if (input.couponCode?.trim()) {
      const ev = await this.coupons.evaluate({
        code: input.couponCode,
        userId: input.userId,
        subtotal,
        productIds,
        categoryIds: [...categoryIds],
      });
      discountTotal = ev.discount;
      couponId = ev.couponId;
      couponCodeSnapshot = ev.code;
    }

    const afterDiscount = subtotal.sub(discountTotal);
    if (afterDiscount.lt(0)) throw new BadRequestException('Invalid totals');

    const ship = await this.shipping.quote({
      country: shippingAddr.country,
      methodCode: input.shippingMethodCode,
      orderSubtotal: afterDiscount,
      totalWeightGrams: totalWeight || 1,
    });

    const shippingTotal = new Prisma.Decimal(ship.price);
    const taxTotal = new Prisma.Decimal(0);
    const grandTotal = afterDiscount.add(shippingTotal).add(taxTotal);

    const orderNo = `ORD-${orderNumber()}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: orderNo,
          userId: input.userId,
          status: OrderStatus.PENDING_PAYMENT,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          currency: cart.currency,
          subtotal,
          discountTotal,
          shippingTotal,
          taxTotal,
          grandTotal,
          couponId,
          couponCodeSnapshot,
          couponDiscount: discountTotal.gt(0) ? discountTotal : null,
          shippingAddressId: shippingAddr.id,
          billingAddressId: billingAddr.id,
          customerNote: input.customerNote,
          placedAt: new Date(),
        },
      });

      for (const line of cart.items) {
        const v = line.variant;
        const img = v.product.images[0]?.url ?? null;
        const optionsSnapshot = v.optionValues.map((ov) => ({
          option: ov.optionValue.option.name,
          value: ov.optionValue.value,
        }));
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: v.id,
            productId: v.productId,
            skuSnapshot: v.sku,
            nameSnapshot: v.product.name,
            variantTitle: v.title,
            unitPrice: v.price,
            compareAtSnapshot: v.compareAtPrice,
            quantity: line.quantity,
            lineTotal: new Prisma.Decimal(v.price).mul(line.quantity),
            imageUrlSnapshot: img,
            productSnapshot: { options: optionsSnapshot, brandId: v.product.brandId },
          },
        });

        if (v.trackInventory) {
          await tx.inventory.update({
            where: { variantId: v.id },
            data: { quantityOnHand: { decrement: line.quantity } },
          });
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      const paymentInit = await this.payments.initiate(input.paymentProvider, {
        order,
        amount: grandTotal,
        currency: cart.currency,
        customerEmail: user.email,
        metadata: { orderNumber: order.orderNumber },
      });

      let paymentStatus = paymentInit.payment.status;
      let finalOrderStatus = order.status;

      if (input.paymentProvider === PaymentProviderKind.COD) {
        paymentStatus = PaymentStatus.PENDING;
        finalOrderStatus = OrderStatus.PAID;
      }

      const pay = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: paymentInit.payment.provider,
          providerRef: paymentInit.payment.providerRef,
          status: paymentStatus,
          amount: grandTotal,
          currency: cart.currency,
          metadata: paymentInit.payment.metadata as Prisma.InputJsonValue,
        },
      });

      await tx.shipment.create({
        data: {
          orderId: order.id,
          methodId: ship.methodId,
          status: FulfillmentStatus.UNFULFILLED,
        },
      });

      if (couponId) {
        await tx.couponUsage.create({
          data: { couponId, userId: input.userId, orderId: order.id },
        });
      }

      const updated =
        finalOrderStatus !== order.status
          ? await tx.order.update({
              where: { id: order.id },
              data: { status: finalOrderStatus },
            })
          : order;

      return { order: updated, payment: pay, clientPayload: paymentInit.clientPayload };
    });

    return {
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      status: result.order.status,
      totals: {
        subtotal: subtotal.toString(),
        discount: discountTotal.toString(),
        shipping: shippingTotal.toString(),
        tax: taxTotal.toString(),
        grandTotal: grandTotal.toString(),
      },
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        provider: result.payment.provider,
        clientPayload: result.clientPayload,
      },
    };
  }
}
