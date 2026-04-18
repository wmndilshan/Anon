import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginateResult } from '../../common/dto/pagination-query.dto';

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(page = 1, pageSize = 20, status?: ProductStatus) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status } : {};
    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: { brand: true, variants: { include: { inventory: true } } },
      }),
    ]);
    return paginateResult(items, total, page, pageSize);
  }

  async getProduct(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        options: { include: { values: true } },
        variants: { include: { inventory: true, optionValues: { include: { optionValue: true } } } },
      },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async createProduct(data: {
    slug: string;
    name: string;
    description?: string;
    brandId?: string;
    status?: ProductStatus;
    variants: { sku: string; price: string; title?: string; quantityOnHand?: number }[];
  }) {
    if (!data.variants?.length) throw new BadRequestException('At least one variant required');
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          slug: data.slug,
          name: data.name,
          description: data.description,
          brandId: data.brandId,
          status: data.status ?? ProductStatus.DRAFT,
        },
      });
      for (let i = 0; i < data.variants.length; i++) {
        const v = data.variants[i];
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku,
            title: v.title,
            price: new Prisma.Decimal(v.price),
            isDefault: i === 0,
          },
        });
        await tx.inventory.create({
          data: {
            variantId: variant.id,
            quantityOnHand: v.quantityOnHand ?? 0,
          },
        });
      }
      return this.getProduct(product.id);
    });
  }

  async updateProduct(
    id: string,
    data: Partial<{ name: string; description: string; status: ProductStatus; brandId: string | null }>,
  ) {
    await this.prisma.product.findUniqueOrThrow({ where: { id } });
    return this.prisma.product.update({ where: { id }, data });
  }

  async upsertInventory(variantId: string, quantityOnHand: number) {
    return this.prisma.inventory.upsert({
      where: { variantId },
      create: { variantId, quantityOnHand },
      update: { quantityOnHand },
    });
  }
}
