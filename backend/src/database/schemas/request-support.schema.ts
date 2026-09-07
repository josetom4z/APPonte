import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RequestSupportDocument = RequestSupport & Document;

@Schema({ timestamps: true })
export class RequestSupport {
  @Prop({ type: Types.ObjectId, ref: 'Request', required: true, index: true })
  requestId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;
}

export const RequestSupportSchema = SchemaFactory.createForClass(RequestSupport);
RequestSupportSchema.index({ requestId: 1, userId: 1 }, { unique: true });
