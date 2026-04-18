import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginateResult } from '../../common/dto/pagination-query.dto';

export type ProductListQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  inStock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  private baseProductWhere(): Prisma.ProductWhereInput {
    return { status: ProductStatus.ACTIVE };
  }

  async listProducts(query: ProductListQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = { ...this.baseProductWhere() };

    if (query.q?.trim()) {
      where.OR = [
        { name: { contains: query.q.trim(), mode: 'insensitive' } },
        { description: { contains: query.q.trim(), mode: 'insensitive' } },
      ];
    }
    if (query.categorySlug) {
      where.categories = {
        some: { category: { slug: query.categorySlug } },
      };
    }
    if (query.brandSlug) {
      where.brand = { slug: query.brandSlug };
    }
    if (query.featured !== undefined) where.featured = query.featured;
    if (query.isNew !== undefined) where.isNew = query.isNew;
    if (query.onSale !== undefined) where.onSale = query.onSale;

    const variantClauses: Prisma.ProductVariantWhereInput[] = [];
    if (query.minPrice != null || query.maxPrice != null) {
      variantClauses.push({
        price: {
          ...(query.minPrice != null ? { gte: new Prisma.Decimal(query.minPrice) } : {}),
          ...(query.maxPrice != null ? { lte: new Prisma.Decimal(query.maxPrice) } : {}),
        },
      });
    }
    if (query.inStock) {
      variantClauses.push({
        trackInventory: true,
        inventory: { quantityOnHand: { gt: 0 } },
      });
    }
    if (variantClauses.length) {
      where.variants = { some: { AND: variantClauses } };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    switch (query.sort) {
      case 'price_asc':
        orderBy.push({ variants: { _min: { price: 'asc' } } } as Prisma.ProductOrderByWithRelationInput);
        break;
      case 'price_desc':
        orderBy.push({ variants: { _max: { price: 'desc' } } } as Prisma.ProductOrderByWithRelationInput);
        break;
      case 'popular':
        orderBy.push({ reviews: { _count: 'desc' } });
        break;
      case 'newest':
      default:
        orderBy.push({ createdAt: 'desc' });
        break;
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          variants: {
            where: { isDefault: true },
            take: 1,
            include: { inventory: true },
          },
          categories: { include: { category: { select: { slug: true, name: true } } }, take: 3 },
          _count: { select: { reviews: true } },
        },
      }),
    ]);

    const items = rows.map((p) => this.mapProductCard(p));
    return paginateResult(items, total, page, pageSize);
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.ACTIVE },
      include: {
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
        tags: { include: { tag: true } },
        options: { include: { values: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } },
        variants: {
          orderBy: { price: 'asc' },
          include: {
            inventory: true,
            images: { orderBy: { sortOrder: 'asc' } },
            optionValues: { include: { optionValue: { include: { option: true } } } },
          },
        },
        attributeValues: { include: { definition: true } },
        reviews: {
          where: { status: ReviewStatus.APPROVED },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { firstName: true, lastName: true, id: true } } },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async relatedProducts(productId: string, categoryIds: string[], limit = 8) {
    return this.prisma.product.findMany({
      where: {
        id: { not: productId },
        status: ProductStatus.ACTIVE,
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      take: limit,
      include: {
        brand: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { where: { isDefault: true }, take: 1, include: { inventory: true } },
      },
    });
  }

  async listCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async listBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  async listCollections(featured?: boolean) {
    return this.prisma.collection.findMany({
      where: { isActive: true, ...(featured !== undefined ? { featured } : {}) },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async homepageBlocks() {
    const [heroBanners, promoBanners, announcement, sections, featuredCollections] =
      await this.prisma.$transaction([
        this.prisma.banner.findMany({
          where: { placement: 'HERO', isActive: true },
          orderBy: { sortOrder: 'asc' },
        }),
        this.prisma.banner.findMany({
          where: { placement: 'PROMO', isActive: true },
          orderBy: { sortOrder: 'asc' },
        }),
        this.prisma.banner.findMany({
          where: { placement: 'ANNOUNCEMENT', isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        }),
        this.prisma.homepageSection.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        }),
        this.prisma.collection.findMany({
          where: { isActive: true, featured: true },
          take: 6,
          orderBy: { sortOrder: 'asc' },
        }),
      ]);

    return {
      heroBanners,
      promoBanners,
      announcementBar: announcement[0] ?? null,
      sections,
      featuredCollections,
    };
  }

  private mapProductCard(p: {
    id: string;
    slug: string;
    name: string;
    featured: boolean;
    isNew: boolean;
    onSale: boolean;
    brand: { name: string; slug: string } | null;
    images: { url: string; alt: string | null }[];
    variants: { price: Prisma.Decimal; inventory: { quantityOnHand: number } | null; trackInventory: boolean }[];
    categories: { category: { slug: string; name: string } }[];
    _count: { reviews: number };
  }) {
    const v = p.variants[0];
    const price = v?.price;
    const inStock =
      !v?.trackInventory || (v.inventory?.quantityOnHand ?? 0) > 0;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      featured: p.featured,
      isNew: p.isNew,
      onSale: p.onSale,
      brand: p.brand,
      thumbnail: p.images[0]?.url ?? null,
      price: price?.toString() ?? null,
      inStock,
      categories: p.categories.map((c) => c.category),
      reviewCount: p._count.reviews,
    };
  }
}
