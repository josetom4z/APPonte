import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../database/schemas';
import { UpdateProfileDto, CreateUserAdminDto, FilterUsersDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: dto },
      { new: true },
    );
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async createByAdmin(dto: CreateUserAdminDto) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = new this.userModel({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role,
      tenantId: dto.tenantId ? new Types.ObjectId(dto.tenantId) : undefined,
      departmentId: dto.departmentId ? new Types.ObjectId(dto.departmentId) : undefined,
      phone: dto.phone,
      status: 'ACTIVE',
      isEmailVerified: true,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.name)}`,
    });

    await user.save();
    const obj = user.toObject();
    delete obj.passwordHash;
    return obj;
  }

  async findAll(filter: FilterUsersDto, currentTenantId?: string) {
    const query: any = {};

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
      ];
    }

    if (filter.role) query.role = filter.role;
    if (filter.status) query.status = filter.status;
    if (filter.departmentId) query.departmentId = new Types.ObjectId(filter.departmentId);

    const tenant = filter.tenantId || currentTenantId;
    if (tenant) {
      query.tenantId = new Types.ObjectId(tenant);
    }

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ [filter.sortBy || 'createdAt']: filter.sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate('tenantId', 'name slug city state')
        .populate('departmentId', 'name slug')
        .lean(),
      this.userModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .populate('tenantId', 'name slug city state logoUrl')
      .populate('departmentId', 'name slug icon')
      .lean();
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async toggleStatus(id: string, status: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }
}
