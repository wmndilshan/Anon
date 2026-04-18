import { BadRequestException, Injectable } from '@nestjs/common';
import { Order, PaymentProviderKind } from '@prisma/client';
import { CreatePaymentContext, IPaymentProvider, PaymentProviderResult } from './payment-provider.interface';
import { CodPaymentProvider } from './providers/cod.provider';
import { StripePaymentProvider } from './providers/stripe.provider';

@Injectable()
export class PaymentOrchestratorService {
  private readonly providers: Map<PaymentProviderKind, IPaymentProvider>;

  constructor(
    private readonly cod: CodPaymentProvider,
    private readonly stripe: StripePaymentProvider,
  ) {
    this.providers = new Map([
      [PaymentProviderKind.COD, cod],
      [PaymentProviderKind.STRIPE, stripe],
    ]);
  }

  resolve(provider: PaymentProviderKind): IPaymentProvider {
    const p = this.providers.get(provider);
    if (!p) throw new BadRequestException(`Payment provider not registered: ${provider}`);
    return p;
  }

  async initiate(
    provider: PaymentProviderKind,
    ctx: CreatePaymentContext,
  ): Promise<PaymentProviderResult> {
    return this.resolve(provider).createPayment(ctx);
  }
}
