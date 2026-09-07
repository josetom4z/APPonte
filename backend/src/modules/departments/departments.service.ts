import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from '../../database/schemas';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/departments.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(dto: CreateDepartmentDto) {
    const existing = await this.departmentModel.findOne({
      tenantId: new Types.ObjectId(dto.tenantId),
      slug: dto.slug.toLowerCase(),
    });

    if (existing) {
      throw new ConflictException('Já existe uma secretaria com este slug para esta prefeitura.');
    }

    const dept = new this.departmentModel({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      secretaryUserId: dto.secretaryUserId ? new Types.ObjectId(dto.secretaryUserId) : undefined,
      slug: dto.slug.toLowerCase(),
      active: true,
    });

    return dept.save();
  }

  async findByTenant(tenantId: string) {
    return this.departmentModel
      .find({ tenantId: new Types.ObjectId(tenantId), active: true })
      .populate('secretaryUserId', 'name email avatarUrl')
      .sort({ name: 1 })
      .lean();
  }

  async findById(id: string) {
    const dept = await this.departmentModel
      .findById(id)
      .populate('secretaryUserId', 'name email avatarUrl')
      .lean();
    if (!dept) throw new NotFoundException('Secretaria não encontrada.');
    return dept;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const updateData: any = { ...dto };
    if (dto.secretaryUserId) {
      updateData.secretaryUserId = new Types.ObjectId(dto.secretaryUserId);
    }

    const dept = await this.departmentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    if (!dept) throw new NotFoundException('Secretaria não encontrada.');
    return dept;
  }
}
