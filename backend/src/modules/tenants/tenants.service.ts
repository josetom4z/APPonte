import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../../database/schemas';
import { CreateTenantDto, UpdateTenantDto, FilterTenantsDto } from './dto/tenants.dto';

@Injectable()
export class TenantsService {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>) {}

  async create(dto: CreateTenantDto) {
    const existing = await this.tenantModel.findOne({ slug: dto.slug.toLowerCase() });
    if (existing) {
      throw new ConflictException('Já existe uma prefeitura cadastrada com este slug identificador.');
    }

    const tenant = new this.tenantModel({
      ...dto,
      slug: dto.slug.toLowerCase(),
      status: 'ACTIVE',
    });

    return tenant.save();
  }

  async findAll(filter: FilterTenantsDto) {
    const query: any = {};

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { city: { $regex: filter.search, $options: 'i' } },
        { slug: { $regex: filter.search, $options: 'i' } },
      ];
    }

    if (filter.state) query.state = filter.state.toUpperCase();
    if (filter.status) query.status = filter.status;

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.tenantModel
        .find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.tenantModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findActiveCities() {
    return this.tenantModel
      .find({ status: 'ACTIVE' }, 'name slug city state logoUrl settings')
      .sort({ city: 1 })
      .lean();
  }

  async findBySlug(slug: string) {
    const tenant = await this.tenantModel.findOne({ slug: slug.toLowerCase() }).lean();
    if (!tenant) throw new NotFoundException('Prefeitura/Organização não encontrada.');
    return tenant;
  }

  async findById(id: string) {
    const tenant = await this.tenantModel.findById(id).lean();
    if (!tenant) throw new NotFoundException('Prefeitura/Organização não encontrada.');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.tenantModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );
    if (!tenant) throw new NotFoundException('Prefeitura/Organização não encontrada.');
    return tenant;
  }
}
