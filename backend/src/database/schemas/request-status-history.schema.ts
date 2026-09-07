import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RequestStatus } from '../../common/enums';
import { RequestMedia, RequestMediaSchema } from './request.schema';

export type RequestStatusHistoryDocument = RequestStatusHistory & Document;

@Schema({ timestamps: true })
export class RequestStatusHistory {
  @Prop({ type: Types.ObjectId, ref: 'Request', required: true, index: true })
  requestId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(RequestStatus),
    required: true,
  })
  status: RequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  changedById: Types.ObjectId;

  @Prop({ trim: true })
  comment?: string;

  @Prop({ type: [RequestMediaSchema], default: [] })
  evidenceMedia: RequestMedia[];
}

export const RequestStatusHistorySchema = SchemaFactory.createForClass(RequestStatusHistory);
RequestStatusHistorySchema.index({ requestId: 1, createdAt: 1 });
