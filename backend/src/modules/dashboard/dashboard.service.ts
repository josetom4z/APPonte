import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Request,
  RequestDocument,
  User,
  UserDocument,
  Tenant,
  TenantDocument,
  Department,
  DepartmentDocument,
  Advertisement,
  AdvertisementDocument,
} from '../../database/schemas';
import { Role, RequestStatus } from '../../common/enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(Department.name) private deptModel: Model<DepartmentDocument>,
    @InjectModel(Advertisement.name) private adModel: Model<AdvertisementDocument>,
  ) {}

  async getCitizenDashboard(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const [stats, recentRequests] = await Promise.all([
      this.requestModel.aggregate([
        { $match: { authorId: userObjectId, isDeleted: false } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalSupports: { $sum: '$supportsCount' },
          },
        },
      ]),
      this.requestModel
        .find({ authorId: userObjectId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('departmentId', 'name icon')
        .populate('categoryId', 'name icon color')
        .lean(),
    ]);

    const byStatus: Record<string, number> = {
      PENDING: 0,
      IN_REVIEW: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };
    let totalRequests = 0;
    let totalSupportsReceived = 0;

    stats.forEach((s) => {
      byStatus[s._id] = s.count;
      totalRequests += s.count;
      totalSupportsReceived += s.totalSupports || 0;
    });

    return {
      totalRequests,
      totalSupportsReceived,
      pendingCount: byStatus.PENDING + byStatus.IN_REVIEW,
      inProgressCount: byStatus.IN_PROGRESS,
      resolvedCount: byStatus.RESOLVED,
      byStatus,
      recentRequests,
    };
  }

  async getOperatorDashboard(userId: string, departmentId?: string) {
    const userObjectId = new Types.ObjectId(userId);
    const deptObjectId = departmentId ? new Types.ObjectId(departmentId) : null;

    const [assignedStats, queueStats, assignedRequests] = await Promise.all([
      this.requestModel.aggregate([
        { $match: { assignedToUserId: userObjectId, isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      deptObjectId
        ? this.requestModel.aggregate([
            {
              $match: {
                departmentId: deptObjectId,
                status: { $in: [RequestStatus.PENDING, RequestStatus.IN_REVIEW] },
                isDeleted: false,
              },
            },
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ])
        : Promise.resolve([]),
      this.requestModel
        .find({ assignedToUserId: userObjectId, isDeleted: false })
        .sort({ priority: -1, createdAt: 1 })
        .limit(10)
        .populate('categoryId', 'name icon color')
        .populate('authorId', 'name avatarUrl phone')
        .lean(),
    ]);

    const assignedByStatus: Record<string, number> = {
      IN_PROGRESS: 0,
      RESOLVED: 0,
    };
    assignedStats.forEach((s) => {
      assignedByStatus[s._id] = s.count;
    });

    let pendingInDepartment = 0;
    queueStats.forEach((s) => {
      pendingInDepartment += s.count;
    });

    return {
      assignedTotal: assignedRequests.length,
      assignedInProgress: assignedByStatus.IN_PROGRESS || 0,
      assignedResolved: assignedByStatus.RESOLVED || 0,
      pendingInDepartment,
      assignedRequests,
    };
  }

  async getSecretaryDashboard(tenantId: string, departmentId: string) {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const deptObjectId = new Types.ObjectId(departmentId);

    const [statusStats, categoryStats, operators, recentActivity] = await Promise.all([
      this.requestModel.aggregate([
        { $match: { tenantId: tenantObjectId, departmentId: deptObjectId, isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.requestModel.aggregate([
        { $match: { tenantId: tenantObjectId, departmentId: deptObjectId, isDeleted: false } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'requestcategories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$category.name', color: '$category.color', count: 1 } },
        { $sort: { count: -1 } },
      ]),
      this.userModel
        .find({ tenantId: tenantObjectId, departmentId: deptObjectId, role: Role.OPERATOR })
        .select('name email avatarUrl status')
        .lean(),
      this.requestModel
        .find({ tenantId: tenantObjectId, departmentId: deptObjectId, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(8)
        .populate('categoryId', 'name icon color')
        .populate('assignedToUserId', 'name avatarUrl')
        .populate('authorId', 'name avatarUrl')
        .lean(),
    ]);

    let total = 0;
    let resolved = 0;
    const byStatus: Record<string, number> = {};
    statusStats.forEach((s) => {
      byStatus[s._id] = s.count;
      total += s.count;
      if (s._id === RequestStatus.RESOLVED) resolved = s.count;
    });

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      resolved,
      resolutionRate,
      byStatus,
      byCategory: categoryStats,
      operatorsCount: operators.length,
      operators,
      recentActivity,
    };
  }

  async getAdminDashboard(tenantId?: string) {
    const query: any = { isDeleted: false };
    const userQuery: any = {};
    const adQuery: any = {};

    if (tenantId) {
      const tId = new Types.ObjectId(tenantId);
      query.tenantId = tId;
      userQuery.tenantId = tId;
      adQuery.$or = [{ tenantId: tId }, { tenantId: null }];
    }

    const [
      totalRequests,
      statusStats,
      deptStats,
      totalUsers,
      usersByRole,
      totalTenants,
      adsStats,
      recentRequests,
    ] = await Promise.all([
      this.requestModel.countDocuments(query),
      this.requestModel.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.requestModel.aggregate([
        { $match: query },
        { $group: { _id: '$departmentId', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'department',
          },
        },
        { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$department.name', count: 1 } },
        { $sort: { count: -1 } },
      ]),
      this.userModel.countDocuments(userQuery),
      this.userModel.aggregate([
        { $match: userQuery },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      this.tenantModel.countDocuments({ status: 'ACTIVE' }),
      this.adModel.aggregate([
        { $match: adQuery },
        {
          $group: {
            _id: null,
            totalImpressions: { $sum: '$impressionsCount' },
            totalClicks: { $sum: '$clicksCount' },
            activeAds: { $sum: 1 },
          },
        },
      ]),
      this.requestModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('tenantId', 'name city')
        .populate('departmentId', 'name')
        .populate('categoryId', 'name color')
        .populate('authorId', 'name avatarUrl')
        .lean(),
    ]);

    let resolvedCount = 0;
    const byStatus: Record<string, number> = {};
    statusStats.forEach((s) => {
      byStatus[s._id] = s.count;
      if (s._id === RequestStatus.RESOLVED) resolvedCount = s.count;
    });

    const resolutionRate = totalRequests > 0 ? Math.round((resolvedCount / totalRequests) * 100) : 0;

    return {
      totalRequests,
      resolvedCount,
      resolutionRate,
      byStatus,
      byDepartment: deptStats,
      totalUsers,
      usersByRole,
      totalTenants,
      adsMetrics: adsStats[0] || { totalImpressions: 0, totalClicks: 0, activeAds: 0 },
      recentRequests,
    };
  }

  async getPlatformStats() {
    // Public platform counters for Landing Page
    const [totalRequests, totalResolved, totalCities, totalCitizens] = await Promise.all([
      this.requestModel.countDocuments({ isDeleted: false }),
      this.requestModel.countDocuments({ status: RequestStatus.RESOLVED, isDeleted: false }),
      this.tenantModel.countDocuments({ status: 'ACTIVE' }),
      this.userModel.countDocuments({ role: Role.CITIZEN }),
    ]);

    const resolutionRate = totalRequests > 0 ? Math.round((totalResolved / totalRequests) * 100) : 94;

    return {
      totalRequests,
      totalResolved,
      totalCities,
      totalCitizens,
      resolutionRate,
    };
  }
}
