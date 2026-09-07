import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlanTier } from '../../common/enums';

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true, trim: true })
  name: string; // Ex: Gratuito, Essencial Cidadão, Prefeitura Pro, Prefeitura Enterprise

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ required: true, enum: Object.values(PlanTier), default: PlanTier.FREE })
  tier: PlanTier;

  @Prop({ required: true, default: 0 })
  priceMonthly: number;

  @Prop({ required: true, default: 0 })
  priceYearly: number;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({
    type: {
      maxRequestsPerMonth: { type: Number, default: 100 },
      maxStorageMb: { type: Number, default: 1024 },
      customDomain: { type: Boolean, default: false },
      removeAds: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      operatorsLimit: { type: Number, default: 5 },
    },
    default: {},
  })
  limits: {
    maxRequestsPerMonth: number;
    maxStorageMb: number;
    customDomain: boolean;
    removeAds: boolean;
    advancedAnalytics: boolean;
    operatorsLimit: number;
  };

  @Prop({ default: true })
  active: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
