import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestCategory, RequestCategoryDocument } from '../../database/schemas';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/request-categories.dto';

@Injectable()
export class RequestCategoriesService {
  constructor(
    @InjectModel(RequestCategory.name)
    private categoryModel: Model<RequestCategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryModel.findOne({
      tenantId: new Types.ObjectId(dto.tenantId),
      slug: dto.slug.toLowerCase(),
    });

    if (existing) {
      throw new ConflictException('Já existe uma categoria com este slug para esta prefeitura.');
    }

    const cat = new this.categoryModel({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      departmentId: new Types.ObjectId(dto.departmentId),
      slug: dto.slug.toLowerCase(),
      active: true,
    });

    return cat.save();
  }

  async findByTenant(tenantId: string, departmentId?: string) {
    const query: any = {
      tenantId: new Types.ObjectId(tenantId),
      active: true,
    };
    if (departmentId) {
      query.departmentId = new Types.ObjectId(departmentId);
    }

    return this.categoryModel
      .find(query)
      .populate('departmentId', 'name slug icon')
      .sort({ name: 1 })
      .lean();
  }

  async findById(id: string) {
    const cat = await this.categoryModel
      .findById(id)
      .populate('departmentId', 'name slug icon contactEmail')
      .lean();
    if (!cat) throw new NotFoundException('Categoria não encontrada.');
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.categoryModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );
    if (!cat) throw new NotFoundException('Categoria não encontrada.');
    return cat;
  }
}
