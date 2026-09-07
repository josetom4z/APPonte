import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, trim: true })
  name: string; // Ex: Prefeitura Municipal de Nova Esperança

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string; // Ex: nova-esperanca

  @Prop({ trim: true })
  cnpj?: string;

  @Prop({ required: true, trim: true, index: true })
  city: string; // Ex: Nova Esperança

  @Prop({ required: true, trim: true, length: 2, uppercase: true })
  state: string; // Ex: SP

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ default: '' })
  bannerUrl: string;

  @Prop({ trim: true })
  contactEmail?: string;

  @Prop({ trim: true })
  contactPhone?: string;

  @Prop({ trim: true })
  domain?: string; // Domínio customizado (ex: apponte.novaesperanca.sp.gov.br)

  @Prop({
    type: {
      primaryColor: { type: String, default: '#10b981' },
      accentColor: { type: String, default: '#06b6d4' },
      autoAssignOperator: { type: Boolean, default: false },
      allowPublicComments: { type: Boolean, default: true },
      requireEvidenceOnResolution: { type: Boolean, default: true },
    },
    default: {},
  })
  settings: {
    primaryColor: string;
    accentColor: string;
    autoAssignOperator: boolean;
    allowPublicComments: boolean;
    requireEvidenceOnResolution: boolean;
  };

  @Prop({
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'TRIAL'],
    default: 'ACTIVE',
    index: true,
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Plan' })
  planId?: Types.ObjectId;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
TenantSchema.index({ city: 1, state: 1 });
