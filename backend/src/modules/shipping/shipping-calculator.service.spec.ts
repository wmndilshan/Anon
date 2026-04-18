import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ShippingCalculatorService } from './shipping-calculator.service';

function baseRule(overrides: Partial<any> = {}) {
  return {
    id: 'rule-1',
    rateType: 'FLAT',
    price: new Prisma.Decimal(5),
    minOrderValue: null,
    maxOrderValue: null,
    minWeightGrams: null,
    maxWeightGrams: null,
    ...overrides,
  };
}

function makePrisma() {
  return {
    shippingMethod: { findUnique: jest.fn() },
    shippingZone: { findMany: jest.fn() },
    shippingRateRule: { findMany: jest.fn() },
  } as any;
}

describe('ShippingCalculatorService', () => {
  let service: ShippingCalculatorService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new ShippingCalculatorService(prisma);
  });

  // ── quote ─────────────────────────────────────────────────────────────────

  describe('quote', () => {
    it('throws NotFoundException when method is not found', async () => {
      prisma.shippingMethod.findUnique.mockResolvedValue(null);
      await expect(
        service.quote({ country: 'US', methodCode: 'STANDARD', orderSubtotal: new Prisma.Decimal(100), totalWeightGrams: 500 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when method is inactive', async () => {
      prisma.shippingMethod.findUnique.mockResolvedValue({ id: 'm1', code: 'STANDARD', isActive: false });
      await expect(
        service.quote({ country: 'US', methodCode: 'STANDARD', orderSubtotal: new Prisma.Decimal(100), totalWeightGrams: 500 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when no zone found for country', async () => {
      prisma.shippingMethod.findUnique.mockResolvedValue({ id: 'm1', code: 'STANDARD', isActive: true });
      prisma.shippingZone.findMany.mockResolvedValue([]);
      await expect(
        service.quote({ country: 'ZZ', methodCode: 'STANDARD', orderSubtotal: new Prisma.Decimal(100), totalWeightGrams: 500 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when no rule matches', async () => {
      prisma.shippingMethod.findUnique.mockResolvedValue({ id: 'm1', code: 'STANDARD', isActive: true });
      prisma.shippingZone.findMany.mockResolvedValue([{ id: 'z1' }]);
      // Rule with minOrderValue higher than subtotal (won't match)
      prisma.shippingRateRule.findMany.mockResolvedValue([
        baseRule({ minOrderValue: new Prisma.Decimal(500) }),
      ]);
      await expect(
        service.quote({ country: 'US', methodCode: 'STANDARD', orderSubtotal: new Prisma.Decimal(10), totalWeightGrams: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns the matching rule result', async () => {
      prisma.shippingMethod.findUnique.mockResolvedValue({ id: 'm1', name: 'Standard', code: 'STANDARD', isActive: true });
      prisma.shippingZone.findMany.mockResolvedValue([{ id: 'z1' }]);
      prisma.shippingRateRule.findMany.mockResolvedValue([baseRule()]);

      const result = await service.quote({
        country: 'US',
        methodCode: 'STANDARD',
        orderSubtotal: new Prisma.Decimal(100),
        totalWeightGrams: 500,
      });

      expect(result).toMatchObject({ methodId: 'm1', zoneId: 'z1', price: '5' });
    });
  });

  // ── ruleMatches (via quote) ───────────────────────────────────────────────

  describe('ruleMatches edge cases', () => {
    function setupMethod() {
      prisma.shippingMethod.findUnique.mockResolvedValue({ id: 'm1', name: 'Standard', code: 'STANDARD', isActive: true });
      prisma.shippingZone.findMany.mockResolvedValue([{ id: 'z1' }]);
    }

    it('matches rule with only minOrderValue when subtotal is sufficient', async () => {
      setupMethod();
      prisma.shippingRateRule.findMany.mockResolvedValue([
        baseRule({ minOrderValue: new Prisma.Decimal(50) }),
      ]);

      await expect(
        service.quote({ country: 'US', methodCode: 'STANDARD', orderSubtotal: new Prisma.Decimal(100), totalWeightGrams: 100 }),
      ).resolves.toMatchObject({ price: '5' });
    });

    it('does not match rule when subtotal is below minOrderValue', async () => {
      setupMethod();
      prisma.shippingRateRule.findMany.mockResolvedValue([
        baseRule({ minOrderValue: new Prisma.Decimal(200) }),
      ]);

      await expect(
        service.quote({ country: 'US', methodCode: 'STANDARD', orderSubtotal: new Prisma.Decimal(100), totalWeightGrams: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not match rule when subtotal exceeds maxOrderValue', async () => {
      setupMethod();
      prisma.shippingRateRule.findMany.mockResolvedValue([
        baseRule({ maxOrderValue: new Prisma.Decimal(50) }),
      ]);

      await expect(
        service.quote({ country: 'US', methodCode: 'STANDARD', orderSubtotal: new Prisma.Decimal(100), totalWeightGrams: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not match rule when weight is below minWeightGrams', async () => {
      setupMethod();
      prisma.shippingRateRule.findMany.mockResolvedValue([
        baseRule({ minWeightGrams: 500 }),
      ]);

      await expect(
        service.quote({ country: 'US', methodCode: 'STANDARD', orderSubtotal: new Prisma.Decimal(100), totalWeightGrams: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not match rule when weight exceeds maxWeightGrams', async () => {
      setupMethod();
      prisma.shippingRateRule.findMany.mockResolvedValue([
        baseRule({ maxWeightGrams: 100 }),
      ]);

      await expect(
        service.quote({ country: 'US', methodCode: 'STANDARD', orderSubtotal: new Prisma.Decimal(100), totalWeightGrams: 500 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
