import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Plan, PlanDocument, Subscription, SubscriptionDocument, Tenant, TenantDocument } from '../../database/schemas';

@Injectable()
export class SaasPlansService {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
    @InjectModel(Subscription.name) private subModel: Model<SubscriptionDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async getPublicPlans() {
    return this.planModel.find({ active: true }).sort({ priceMonthly: 1 }).lean();
  }

  async createPlan(data: any) {
    return this.planModel.create(data);
  }

  async getTenantSubscription(tenantId: string) {
    return this.subModel
      .findOne({ tenantId: new Types.ObjectId(tenantId), status: 'ACTIVE' })
      .populate('planId')
      .lean();
  }

  async assignSubscription(tenantId: string, planId: string, durationMonths = 12) {
    const plan = await this.planModel.findById(planId);
    if (!plan) throw new NotFoundException('Plano não encontrado.');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Cancel old active subs
    await this.subModel.updateMany(
      { tenantId: new Types.ObjectId(tenantId), status: 'ACTIVE' },
      { $set: { status: 'CANCELED' } },
    );

    const sub = await this.subModel.create({
      tenantId: new Types.ObjectId(tenantId),
      planId: new Types.ObjectId(planId),
      status: 'ACTIVE',
      startDate,
      endDate,
      autoRenew: true,
    });

    await this.tenantModel.updateOne(
      { _id: new Types.ObjectId(tenantId) },
      { $set: { planId: new Types.ObjectId(planId) } },
    );

    return sub;
  }
}
