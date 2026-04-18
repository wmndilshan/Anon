import { NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus, ReviewStatus } from '@prisma/client';
import { CatalogService } from './catalog.service';

function makePrisma() {
  return {
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    category: { findMany: jest.fn() },
    brand: { findMany: jest.fn() },
    collection: { findMany: jest.fn() },
    banner: { findMany: jest.fn() },
    homepageSection: { findMany: jest.fn() },
    $transaction: jest.fn(),
  } as any;
}

function makeProductRow(overrides: Partial<any> = {}) {
  return {
    id: 'p1',
    slug: 'test-product',
    name: 'Test Product',
    featured: false,
    isNew: false,
    onSale: false,
    brand: null,
    images: [],
    variants: [],
    categories: [],
    _count: { reviews: 0 },
    ...overrides,
  };
}

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CatalogService(prisma);
  });

  // ── listProducts ──────────────────────────────────────────────────────────

  describe('listProducts', () => {
    it('returns a paginated product list', async () => {
      prisma.$transaction.mockResolvedValue([2, [makeProductRow(), makeProductRow({ id: 'p2', slug: 'p2' })]]);

      const result = await service.listProducts({});
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('uses default pagination when none provided', async () => {
      prisma.$transaction.mockResolvedValue([0, []]);
      const result = await service.listProducts({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('maps product card fields correctly', async () => {
      const variant = {
        price: new Prisma.Decimal('29.99'),
        trackInventory: false,
        inventory: null,
      };
      const row = makeProductRow({
        variants: [variant],
        images: [{ url: 'https://img.test/p.jpg', alt: null }],
        brand: { name: 'Acme', slug: 'acme' },
      });
      prisma.$transaction.mockResolvedValue([1, [row]]);

      const result = await service.listProducts({});
      const card = result.items[0] as any;
      expect(card.price).toBe('29.99');
      expect(card.thumbnail).toBe('https://img.test/p.jpg');
      expect(card.brand).toEqual({ name: 'Acme', slug: 'acme' });
      expect(card.inStock).toBe(true);
    });

    it('marks inStock false when trackInventory is true and quantity is 0', async () => {
      const variant = {
        price: new Prisma.Decimal('10'),
        trackInventory: true,
        inventory: { quantityOnHand: 0 },
      };
      prisma.$transaction.mockResolvedValue([1, [makeProductRow({ variants: [variant] })]]);

      const result = await service.listProducts({});
      expect((result.items[0] as any).inStock).toBe(false);
    });
  });

  // ── getProductBySlug ──────────────────────────────────────────────────────

  describe('getProductBySlug', () => {
    it('returns the product when found', async () => {
      const product = makeProductRow();
      prisma.product.findFirst.mockResolvedValue(product);

      const result = await service.getProductBySlug('test-product');
      expect(result).toBe(product);
    });

    it('throws NotFoundException when product is not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      await expect(service.getProductBySlug('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── relatedProducts ───────────────────────────────────────────────────────

  describe('relatedProducts', () => {
    it('returns related products excluding the given productId', async () => {
      const related = [makeProductRow({ id: 'p2', slug: 'p2' })];
      prisma.product.findMany.mockResolvedValue(related);

      const result = await service.relatedProducts('p1', ['cat-1']);
      expect(result).toBe(related);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: { not: 'p1' } }),
        }),
      );
    });
  });

  // ── listCategories ────────────────────────────────────────────────────────

  describe('listCategories', () => {
    it('returns active root categories', async () => {
      const cats = [{ id: 'cat-1', name: 'Electronics', children: [] }];
      prisma.category.findMany.mockResolvedValue(cats);

      const result = await service.listCategories();
      expect(result).toBe(cats);
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true, parentId: null } }),
      );
    });
  });

  // ── listBrands ────────────────────────────────────────────────────────────

  describe('listBrands', () => {
    it('returns brands ordered by name', async () => {
      const brands = [{ id: 'b1', name: 'Acme' }];
      prisma.brand.findMany.mockResolvedValue(brands);

      const result = await service.listBrands();
      expect(result).toBe(brands);
    });
  });

  // ── listCollections ───────────────────────────────────────────────────────

  describe('listCollections', () => {
    it('returns all active collections when featured is undefined', async () => {
      const cols = [{ id: 'c1' }];
      prisma.collection.findMany.mockResolvedValue(cols);

      const result = await service.listCollections();
      expect(result).toBe(cols);
      expect(prisma.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } }),
      );
    });

    it('filters by featured when specified', async () => {
      prisma.collection.findMany.mockResolvedValue([]);
      await service.listCollections(true);
      expect(prisma.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true, featured: true } }),
      );
    });
  });

  // ── homepageBlocks ────────────────────────────────────────────────────────

  describe('homepageBlocks', () => {
    it('returns structured homepage data', async () => {
      const heroBanners = [{ id: 'b1', placement: 'HERO' }];
      const promoBanners: any[] = [];
      const announcement: any[] = [];
      const sections: any[] = [];
      const featuredCollections: any[] = [];

      prisma.$transaction.mockResolvedValue([
        heroBanners,
        promoBanners,
        announcement,
        sections,
        featuredCollections,
      ]);

      const result = await service.homepageBlocks();
      expect(result).toMatchObject({
        heroBanners,
        promoBanners,
        announcementBar: null,
        sections,
        featuredCollections,
      });
    });

    it('picks first announcement banner when available', async () => {
      const announcement = [{ id: 'ann-1', placement: 'ANNOUNCEMENT' }];
      prisma.$transaction.mockResolvedValue([[], [], announcement, [], []]);

      const result = await service.homepageBlocks();
      expect(result.announcementBar).toEqual(announcement[0]);
    });
  });
});
