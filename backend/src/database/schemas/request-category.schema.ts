import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RequestPriority } from '../../common/enums';

export type RequestCategoryDocument = RequestCategory & Document;

@Schema()
export class Subcategory {
  @Prop({ required: true, trim: true })
  name: string; // Ex: Buraco na via, Asfalto danificado

  @Prop({ required: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ default: true })
  active: boolean;
}

export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);

@Schema({ timestamps: true })
export class RequestCategory {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true, index: true })
  departmentId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // Ex: Vias Públicas e Pavimentação

  @Prop({ required: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: 'wrench' })
  icon: string;

  @Prop({ default: '#3b82f6' })
  color: string;

  @Prop({
    type: String,
    enum: Object.values(RequestPriority),
    default: RequestPriority.MEDIUM,
  })
  defaultPriority: RequestPriority;

  @Prop({ default: 72 }) // SLA padrão em horas (ex: 72h = 3 dias)
  slaHours: number;

  @Prop({ type: [SubcategorySchema], default: [] })
  subcategories: Subcategory[];

  @Prop({ default: true, index: true })
  active: boolean;
}

export const RequestCategorySchema = SchemaFactory.createForClass(RequestCategory);
RequestCategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
