import { Injectable } from '@nestjs/common';
import { OrderStatus, ProductStatus, ReviewStatus, UserType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [
      orders30d,
      revenueAgg,
      customers,
      products,
      pendingReviews,
      lowStockVariants,
    ] = await this.prisma.$transaction([
      this.prisma.order.count({
        where: { createdAt: { gte: since }, status: { not: OrderStatus.CANCELLED } },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: since },
          status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
        },
        _sum: { grandTotal: true },
      }),
      this.prisma.user.count({ where: { userType: UserType.CUSTOMER } }),
      this.prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
      this.prisma.inventory.count({
        where: { quantityOnHand: { lte: 5 }, variant: { trackInventory: true } },
      }),
    ]);

    return {
      ordersLast30Days: orders30d,
      revenueLast30Days: revenueAgg._sum.grandTotal?.toString() ?? '0',
      customerCount: customers,
      activeProducts: products,
      pendingReviews,
      lowStockVariants,
    };
  }
}
