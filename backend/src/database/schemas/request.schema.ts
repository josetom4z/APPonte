import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RequestStatus, RequestPriority, MediaType } from '../../common/enums';

export type RequestDocument = Request & Document;

@Schema({ _id: false })
export class GeoLocation {
  @Prop({ type: String, enum: ['Point'], default: 'Point', required: true })
  type: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: number[];
}

export const GeoLocationSchema = SchemaFactory.createForClass(GeoLocation);

@Schema({ _id: false })
export class RequestAddress {
  @Prop({ trim: true })
  formattedAddress: string;

  @Prop({ trim: true })
  street?: string;

  @Prop({ trim: true })
  number?: string;

  @Prop({ trim: true })
  neighborhood?: string; // Bairro

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true, uppercase: true })
  state: string;

  @Prop({ trim: true })
  postalCode?: string; // CEP

  @Prop({ trim: true })
  reference?: string; // Ponto de referência
}

export const RequestAddressSchema = SchemaFactory.createForClass(RequestAddress);

@Schema({ _id: false })
export class RequestMedia {
  @Prop({ required: true })
  url: string;

  @Prop({ type: String, enum: Object.values(MediaType), default: MediaType.IMAGE })
  type: MediaType;

  @Prop({ trim: true })
  filename?: string;

  @Prop()
  size?: number;

  @Prop()
  thumbnailUrl?: string;
}

export const RequestMediaSchema = SchemaFactory.createForClass(RequestMedia);

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true, unique: true, index: true, uppercase: true })
  protocol: string; // Ex: APP-2026-0001

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true, index: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'RequestCategory', required: true, index: true })
  categoryId: Types.ObjectId;

  @Prop({ trim: true })
  subcategoryId?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedToUserId?: Types.ObjectId; // Atuante atribuído

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(RequestStatus),
    default: RequestStatus.PENDING,
    index: true,
  })
  status: RequestStatus;

  @Prop({
    type: String,
    enum: Object.values(RequestPriority),
    default: RequestPriority.MEDIUM,
    index: true,
  })
  priority: RequestPriority;

  @Prop({ type: GeoLocationSchema, required: true })
  location: GeoLocation;

  @Prop({ type: RequestAddressSchema, required: true })
  address: RequestAddress;

  @Prop({ type: [RequestMediaSchema], default: [] })
  media: RequestMedia[];

  @Prop({ default: 0, index: true })
  supportsCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ default: 0 })
  sharesCount: number;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop()
  resolvedAt?: Date;

  @Prop({ type: [RequestMediaSchema], default: [] })
  resolutionMedia: RequestMedia[]; // Fotos comprobatórias da solução realizada

  @Prop({ trim: true })
  resolutionNotes?: string;

  @Prop({ default: false, index: true })
  isDeleted: boolean;
}

export const RequestSchema = SchemaFactory.createForClass(Request);

// 2dsphere index for GeoJSON spatial queries
RequestSchema.index({ location: '2dsphere' });
RequestSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
RequestSchema.index({ tenantId: 1, categoryId: 1 });
RequestSchema.index({ title: 'text', description: 'text', 'address.neighborhood': 'text' });
