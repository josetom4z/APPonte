import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AdPlacement, AdStatus } from '../../common/enums';

export type AdvertisementDocument = Advertisement & Document;

@Schema({ timestamps: true })
export class Advertisement {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId?: Types.ObjectId; // null = global

  @Prop({ required: true, trim: true })
  advertiserName: string;

  @Prop({ trim: true })
  advertiserContact?: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  mediaUrl: string;

  @Prop({ required: true, trim: true })
  targetUrl: string;

  @Prop({
    type: String,
    enum: Object.values(AdPlacement),
    default: AdPlacement.FEED,
    index: true,
  })
  placement: AdPlacement;

  @Prop({ trim: true })
  targetCity?: string;

  @Prop({ trim: true, length: 2, uppercase: true })
  targetState?: string;

  @Prop({ type: Types.ObjectId, ref: 'RequestCategory' })
  targetCategoryId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(AdStatus),
    default: AdStatus.ACTIVE,
    index: true,
  })
  status: AdStatus;

  @Prop({ default: 0 })
  impressionsCount: number;

  @Prop({ default: 0 })
  clicksCount: number;

  @Prop({ default: 0 })
  budget: number;

  @Prop({ required: true, default: Date.now })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
}

export const AdvertisementSchema = SchemaFactory.createForClass(Advertisement);
AdvertisementSchema.index({ status: 1, placement: 1, startDate: 1, endDate: 1 });
