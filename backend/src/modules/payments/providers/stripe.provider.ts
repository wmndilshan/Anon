import { Injectable } from '@nestjs/common';
import { PaymentProviderKind, PaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { CreatePaymentContext, IPaymentProvider, PaymentProviderResult } from '../payment-provider.interface';

/**
 * Stripe integration stub: returns a fake clientSecret.
 * Wire @stripe/stripe-js on frontends to the real PaymentIntent flow.
 */
@Injectable()
export class StripePaymentProvider implements IPaymentProvider {
  readonly kind = PaymentProviderKind.STRIPE;

  async createPayment(ctx: CreatePaymentContext): Promise<PaymentProviderResult> {
    const intentId = `pi_stub_${randomUUID()}`;
    return {
      payment: {
        provider: PaymentProviderKind.STRIPE,
        status: PaymentStatus.PENDING,
        providerRef: intentId,
        metadata: {
          mode: process.env.STRIPE_SECRET_KEY ? 'live-capable' : 'stub',
        },
      },
      clientPayload: {
        clientSecret: `${intentId}_secret_stub`,
        amount: ctx.amount.toString(),
        currency: ctx.currency.toLowerCase(),
      },
    };
  }
}
