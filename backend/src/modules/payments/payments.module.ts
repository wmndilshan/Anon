import { Module } from '@nestjs/common';
import { PaymentOrchestratorService } from './payment-orchestrator.service';
import { CodPaymentProvider } from './providers/cod.provider';
import { StripePaymentProvider } from './providers/stripe.provider';

@Module({
  providers: [CodPaymentProvider, StripePaymentProvider, PaymentOrchestratorService],
  exports: [PaymentOrchestratorService],
})
export class PaymentsModule {}
