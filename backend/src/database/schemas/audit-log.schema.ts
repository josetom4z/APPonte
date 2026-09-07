import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  action: string; // Ex: 'CREATE_REQUEST', 'UPDATE_STATUS', 'LOGIN', 'CREATE_TENANT'

  @Prop({ required: true, trim: true })
  module: string; // Ex: 'requests', 'auth', 'tenants'

  @Prop({ trim: true })
  entityId?: string;

  @Prop({ trim: true })
  ipAddress?: string;

  @Prop({ trim: true })
  userAgent?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  changes?: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ tenantId: 1, module: 1, createdAt: -1 });
