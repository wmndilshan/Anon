import { BadRequestException } from '@nestjs/common';
import { CouponAppliesTo, CouponType, Prisma } from '@prisma/client';
import { CouponService } from './coupon.service';

function baseCoupon(overrides: Partial<any> = {}) {
  return {
    id: 'coupon-1',
    code: 'SAVE10',
    isActive: true,
    type: CouponType.PERCENTAGE,
    value: new Prisma.Decimal(10),
    appliesTo: CouponAppliesTo.ALL,
    startsAt: null,
    endsAt: null,
    minOrderAmount: null,
    maxDiscountAmount: null,
    usageLimitGlobal: null,
    usageLimitPerUser: null,
    couponProducts: [],
    couponCategories: [],
    ...overrides,
  };
}

function makePrisma() {
  return {
    coupon: { findUnique: jest.fn() },
    couponUsage: { count: jest.fn() },
  } as any;
}

describe('CouponService', () => {
  let service: CouponService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CouponService(prisma);
  });

  // ── evaluate: basic validity ──────────────────────────────────────────────

  it('throws when coupon does not exist', async () => {
    prisma.coupon.findUnique.mockResolvedValue(null);
    await expect(
      service.evaluate({ code: 'NOPE', userId: 'u1', subtotal: new Prisma.Decimal(100), productIds: [], categoryIds: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when coupon is inactive', async () => {
    prisma.coupon.findUnique.mockResolvedValue(baseCoupon({ isActive: false }));
    await expect(
      service.evaluate({ code: 'SAVE10', userId: 'u1', subtotal: new Prisma.Decimal(100), productIds: [], categoryIds: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when coupon has not started yet', async () => {
    prisma.coupon.findUnique.mockResolvedValue(
      baseCoupon({ startsAt: new Date(Date.now() + 86400_000) }),
    );
    await expect(
      service.evaluate({ code: 'SAVE10', userId: 'u1', subtotal: new Prisma.Decimal(100), productIds: [], categoryIds: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when coupon has expired', async () => {
    prisma.coupon.findUnique.mockResolvedValue(
      baseCoupon({ endsAt: new Date(Date.now() - 1000) }),
    );
    await expect(
      service.evaluate({ code: 'SAVE10', userId: 'u1', subtotal: new Prisma.Decimal(100), productIds: [], categoryIds: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when order is below minimum amount', async () => {
    prisma.coupon.findUnique.mockResolvedValue(
      baseCoupon({ minOrderAmount: new Prisma.Decimal(200) }),
    );
    await expect(
      service.evaluate({ code: 'SAVE10', userId: 'u1', subtotal: new Prisma.Decimal(50), productIds: [], categoryIds: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── evaluate: appliesTo ───────────────────────────────────────────────────

  it('throws when coupon applies to products and none match cart', async () => {
    prisma.coupon.findUnique.mockResolvedValue(
      baseCoupon({
        appliesTo: CouponAppliesTo.PRODUCTS,
        couponProducts: [{ productId: 'prod-other' }],
      }),
    );
    await expect(
      service.evaluate({ code: 'SAVE10', userId: 'u1', subtotal: new Prisma.Decimal(100), productIds: ['prod-1'], categoryIds: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows coupon when at least one product matches', async () => {
    prisma.coupon.findUnique.mockResolvedValue(
      baseCoupon({
        appliesTo: CouponAppliesTo.PRODUCTS,
        couponProducts: [{ productId: 'prod-1' }],
      }),
    );
    const result = await service.evaluate({
      code: 'SAVE10',
      userId: 'u1',
      subtotal: new Prisma.Decimal(100),
      productIds: ['prod-1'],
      categoryIds: [],
    });
    expect(result).toMatchObject({ couponId: 'coupon-1', code: 'SAVE10' });
  });

  it('throws when coupon applies to categories and none match', async () => {
    prisma.coupon.findUnique.mockResolvedValue(
      baseCoupon({
        appliesTo: CouponAppliesTo.CATEGORIES,
        couponCategories: [{ categoryId: 'cat-other' }],
      }),
    );
    await expect(
      service.evaluate({ code: 'SAVE10', userId: 'u1', subtotal: new Prisma.Decimal(100), productIds: [], categoryIds: ['cat-1'] }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── evaluate: usage limits ────────────────────────────────────────────────

  it('throws when global usage limit is exceeded', async () => {
    prisma.coupon.findUnique.mockResolvedValue(baseCoupon({ usageLimitGlobal: 5 }));
    prisma.couponUsage.count.mockResolvedValue(5);
    await expect(
      service.evaluate({ code: 'SAVE10', userId: 'u1', subtotal: new Prisma.Decimal(100), productIds: [], categoryIds: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when per-user usage limit is exceeded', async () => {
    prisma.coupon.findUnique.mockResolvedValue(baseCoupon({ usageLimitPerUser: 1 }));
    prisma.couponUsage.count.mockResolvedValue(1); // per-user count
    await expect(
      service.evaluate({ code: 'SAVE10', userId: 'u1', subtotal: new Prisma.Decimal(100), productIds: [], categoryIds: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── evaluate: discount calculation ───────────────────────────────────────

  it('calculates PERCENTAGE discount correctly', async () => {
    prisma.coupon.findUnique.mockResolvedValue(baseCoupon({ type: CouponType.PERCENTAGE, value: new Prisma.Decimal(20) }));

    const result = await service.evaluate({
      code: 'SAVE10',
      userId: 'u1',
      subtotal: new Prisma.Decimal(100),
      productIds: [],
      categoryIds: [],
    });

    expect(result.discount.toString()).toBe('20');
  });

  it('calculates FIXED_AMOUNT discount correctly', async () => {
    prisma.coupon.findUnique.mockResolvedValue(
      baseCoupon({ type: CouponType.FIXED_AMOUNT, value: new Prisma.Decimal(15) }),
    );

    const result = await service.evaluate({
      code: 'SAVE10',
      userId: 'u1',
      subtotal: new Prisma.Decimal(100),
      productIds: [],
      categoryIds: [],
    });

    expect(result.discount.toString()).toBe('15');
  });

  it('caps discount at maxDiscountAmount', async () => {
    prisma.coupon.findUnique.mockResolvedValue(
      baseCoupon({
        type: CouponType.PERCENTAGE,
        value: new Prisma.Decimal(50),
        maxDiscountAmount: new Prisma.Decimal(20),
      }),
    );

    const result = await service.evaluate({
      code: 'SAVE10',
      userId: 'u1',
      subtotal: new Prisma.Decimal(100),
      productIds: [],
      categoryIds: [],
    });

    expect(result.discount.toString()).toBe('20');
  });

  it('caps discount at subtotal when discount exceeds subtotal', async () => {
    prisma.coupon.findUnique.mockResolvedValue(
      baseCoupon({ type: CouponType.FIXED_AMOUNT, value: new Prisma.Decimal(200) }),
    );

    const result = await service.evaluate({
      code: 'SAVE10',
      userId: 'u1',
      subtotal: new Prisma.Decimal(50),
      productIds: [],
      categoryIds: [],
    });

    expect(result.discount.toString()).toBe('50');
  });
});
