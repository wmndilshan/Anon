import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShippingCalculatorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves flat rate from first matching rule: zone by country + method code.
   * Weight/value-based rules use simple thresholds when populated in seed.
   */
  async quote(params: {
    country: string;
    methodCode: string;
    orderSubtotal: Prisma.Decimal;
    totalWeightGrams: number;
  }) {
    const method = await this.prisma.shippingMethod.findUnique({ where: { code: params.methodCode } });
    if (!method || !method.isActive) throw new NotFoundException('Shipping method not available');

    const zones = await this.prisma.shippingZone.findMany({
      where: { isActive: true, countries: { has: params.country } },
    });
    if (!zones.length) throw new NotFoundException('No shipping zone for country');

    for (const zone of zones) {
      const rules = await this.prisma.shippingRateRule.findMany({
        where: {
          zoneId: zone.id,
          methodId: method.id,
          isActive: true,
        },
        orderBy: { price: 'asc' },
      });

      for (const rule of rules) {
        if (this.ruleMatches(rule, params)) {
          return {
            methodId: method.id,
            methodName: method.name,
            zoneId: zone.id,
            price: rule.price.toString(),
            ruleId: rule.id,
          };
        }
      }
    }

    throw new NotFoundException('No shipping rate matched');
  }

  private ruleMatches(
    rule: {
      minOrderValue: Prisma.Decimal | null;
      maxOrderValue: Prisma.Decimal | null;
      minWeightGrams: number | null;
      maxWeightGrams: number | null;
      rateType: string;
    },
    params: { orderSubtotal: Prisma.Decimal; totalWeightGrams: number },
  ) {
    const sub = Number(params.orderSubtotal);
    if (rule.minOrderValue != null && sub < Number(rule.minOrderValue)) return false;
    if (rule.maxOrderValue != null && sub > Number(rule.maxOrderValue)) return false;
    if (rule.minWeightGrams != null && params.totalWeightGrams < rule.minWeightGrams) return false;
    if (rule.maxWeightGrams != null && params.totalWeightGrams > rule.maxWeightGrams) return false;
    return true;
  }
}
