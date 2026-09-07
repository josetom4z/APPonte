import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../database/schemas';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name)
    private auditModel: Model<AuditLogDocument>,
  ) {}

  async log(data: {
    tenantId?: string;
    userId?: string;
    action: string;
    module: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    changes?: Record<string, any>;
  }) {
    return this.auditModel.create({
      ...data,
      tenantId: data.tenantId ? new Types.ObjectId(data.tenantId) : undefined,
      userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
    });
  }

  async findAll(tenantId?: string, limit = 50) {
    const query: any = {};
    if (tenantId) {
      query.tenantId = new Types.ObjectId(tenantId);
    }
    return this.auditModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email role')
      .populate('tenantId', 'name city')
      .lean();
  }
}
