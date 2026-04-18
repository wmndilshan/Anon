import { Injectable } from '@nestjs/common';
import { PaymentProviderKind, PaymentStatus } from '@prisma/client';
import { CreatePaymentContext, IPaymentProvider, PaymentProviderResult } from '../payment-provider.interface';

@Injectable()
export class CodPaymentProvider implements IPaymentProvider {
  readonly kind = PaymentProviderKind.COD;

  async createPayment(ctx: CreatePaymentContext): Promise<PaymentProviderResult> {
    return {
      payment: {
        provider: PaymentProviderKind.COD,
        status: PaymentStatus.PENDING,
        providerRef: null,
        metadata: { note: 'Collect on delivery' },
      },
    };
  }
}
