import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // Ex: Secretaria Municipal de Obras e Infraestrutura

  @Prop({ required: true, trim: true, lowercase: true })
  slug: string; // Ex: obras-infraestrutura

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: 'building-2' })
  icon: string;

  @Prop({ trim: true })
  contactEmail?: string;

  @Prop({ trim: true })
  contactPhone?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  secretaryUserId?: Types.ObjectId; // Usuário Secretário responsável

  @Prop({ default: true, index: true })
  active: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
DepartmentSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
