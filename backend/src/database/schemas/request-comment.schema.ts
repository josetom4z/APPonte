import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RequestMedia, RequestMediaSchema } from './request.schema';

export type RequestCommentDocument = RequestComment & Document;

@Schema({ timestamps: true })
export class RequestComment {
  @Prop({ type: Types.ObjectId, ref: 'Request', required: true, index: true })
  requestId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: [RequestMediaSchema], default: [] })
  media: RequestMedia[];

  @Prop({ default: false }) // Flag para notas internas da prefeitura/secretaria
  isInternal: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const RequestCommentSchema = SchemaFactory.createForClass(RequestComment);
RequestCommentSchema.index({ requestId: 1, createdAt: 1 });
