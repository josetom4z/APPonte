import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaasPlansController } from './saas-plans.controller';
import { SaasPlansService } from './saas-plans.service';
import {
  Plan,
  PlanSchema,
  Subscription,
  SubscriptionSchema,
  Tenant,
  TenantSchema,
} from '../../database/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  controllers: [SaasPlansController],
  providers: [SaasPlansService],
  exports: [SaasPlansService],
})
export class SaasPlansModule {}
