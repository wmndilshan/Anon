import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
                inventory: true,
              },
            },
          },
        },
      },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
                  inventory: true,
                },
              },
            },
          },
        },
      });
    }
    return this.formatCart(cart);
  }

  private formatCart(cart: {
    id: string;
    currency: string;
    items: {
      id: string;
      quantity: number;
      variant: {
        id: string;
        sku: string;
        title: string | null;
        price: { toString(): string };
        trackInventory: boolean;
        product: { id: string; name: string; slug: string; images: { url: string }[] };
        inventory: { quantityOnHand: number } | null;
      };
    }[];
  }) {
    const items = cart.items.map((i) => {
      const stock = i.variant.trackInventory
        ? (i.variant.inventory?.quantityOnHand ?? 0)
        : 999999;
      return {
        id: i.id,
        quantity: i.quantity,
        variantId: i.variant.id,
        sku: i.variant.sku,
        title: i.variant.title,
        unitPrice: i.variant.price.toString(),
        maxQuantity: stock,
        product: {
          id: i.variant.product.id,
          name: i.variant.product.name,
          slug: i.variant.product.slug,
          image: i.variant.product.images[0]?.url ?? null,
        },
      };
    });
    const subtotal = cart.items.reduce(
      (s, i) => s + Number(i.variant.price) * i.quantity,
      0,
    );
    return { cartId: cart.id, currency: cart.currency, items, subtotal };
  }

  async addItem(userId: string, variantId: string, quantity: number) {
    if (quantity < 1) throw new BadRequestException('Invalid quantity');
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, product: { status: 'ACTIVE' } },
      include: { inventory: true, product: true },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    if (variant.trackInventory) {
      const onHand = variant.inventory?.quantityOnHand ?? 0;
      const existing = await this.prisma.cartItem.findUnique({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
      });
      const nextQty = (existing?.quantity ?? 0) + quantity;
      if (nextQty > onHand) throw new BadRequestException('Insufficient stock');
    }

    await this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      create: { cartId: cart.id, variantId, quantity },
      update: { quantity: { increment: quantity } },
    });

    return this.getOrCreateCart(userId);
  }

  async setQuantity(userId: string, variantId: string, quantity: number) {
    if (quantity < 1) return this.removeItem(userId, variantId);
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart empty');

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    if (variant.trackInventory) {
      const onHand = variant.inventory?.quantityOnHand ?? 0;
      if (quantity > onHand) throw new BadRequestException('Insufficient stock');
    }

    await this.prisma.cartItem.update({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      data: { quantity },
    });
    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, variantId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { cartId: null, currency: 'USD', items: [], subtotal: 0 };
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } });
    return this.getOrCreateCart(userId);
  }

  async clear(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getOrCreateCart(userId);
  }
}
