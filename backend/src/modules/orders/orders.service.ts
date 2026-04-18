import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginateResult } from '../../common/dto/pagination-query.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { take: 5 },
          payments: true,
          shipments: true,
        },
      }),
    ]);
    return paginateResult(rows, total, page, pageSize);
  }

  async getMine(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: true,
        payments: true,
        shipments: { include: { method: true } },
        shippingAddress: true,
        billingAddress: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async adminList(page = 1, pageSize = 20, status?: string) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status: status as never } : {};
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true, lastName: true } }, items: true },
      }),
    ]);
    return paginateResult(rows, total, page, pageSize);
  }

  async adminGet(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        shipments: { include: { method: true } },
        shippingAddress: true,
        billingAddress: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async adminUpdateStatus(
    id: string,
    data: { status?: string; fulfillmentStatus?: string; trackingNumber?: string },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          ...(data.status ? { status: data.status as never } : {}),
          ...(data.fulfillmentStatus ? { fulfillmentStatus: data.fulfillmentStatus as never } : {}),
        },
      });

      if (data.trackingNumber) {
        const ship = await tx.shipment.findFirst({ where: { orderId: id } });
        if (ship) {
          await tx.shipment.update({
            where: { id: ship.id },
            data: { trackingNumber: data.trackingNumber, status: 'FULFILLED' },
          });
        }
      }

      return updated;
    });
  }
}
