import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, productId: string, data: { rating: number; title?: string; body?: string }) {
    if (data.rating < 1 || data.rating > 5) throw new BadRequestException('Rating 1-5');
    const product = await this.prisma.product.findFirst({
      where: { id: productId, status: ProductStatus.ACTIVE },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });
    if (existing) throw new BadRequestException('Already reviewed');

    return this.prisma.review.create({
      data: {
        productId,
        userId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        status: ReviewStatus.PENDING,
      },
    });
  }

  async listForProduct(productId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = { productId, status: ReviewStatus.APPROVED };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, id: true } } },
      }),
    ]);
    return { items, total, page, pageSize };
  }

  async adminList(status?: ReviewStatus, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status } : {};
    const [total, items] = await this.prisma.$transaction([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: true, product: { select: { name: true, slug: true } } },
      }),
    ]);
    return { items, total, page, pageSize };
  }

  async moderate(id: string, status: ReviewStatus) {
    return this.prisma.review.update({ where: { id }, data: { status } });
  }
}
