import { Order, Payment } from '@prisma/client';

export type CreatePaymentContext = {
  order: Order;
  amount: { toString(): string };
  currency: string;
  customerEmail: string;
  metadata?: Record<string, string>;
};

export type PaymentProviderResult = {
  payment: Pick<Payment, 'status' | 'provider' | 'providerRef' | 'metadata'>;
  clientPayload?: Record<string, unknown>;
};

export interface IPaymentProvider {
  readonly kind: string;
  createPayment(ctx: CreatePaymentContext): Promise<PaymentProviderResult>;
}
