import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Request,
  RequestDocument,
  RequestStatusHistory,
  RequestStatusHistoryDocument,
  RequestCategory,
  RequestCategoryDocument,
  Notification,
  NotificationDocument,
} from '../../database/schemas';
import {
  CreateRequestDto,
  UpdateStatusDto,
  FilterRequestsDto,
  MapRequestsFilterDto,
} from './dto/requests.dto';
import { RequestStatus, NotificationType } from '../../common/enums';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name)
    private requestModel: Model<RequestDocument>,
    @InjectModel(RequestStatusHistory.name)
    private statusHistoryModel: Model<RequestStatusHistoryDocument>,
    @InjectModel(RequestCategory.name)
    private categoryModel: Model<RequestCategoryDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(authorId: string, dto: CreateRequestDto) {
    const category = await this.categoryModel.findById(dto.categoryId);
    const priority = dto.priority || category?.defaultPriority;

    const currentYear = new Date().getFullYear();
    const count = await this.requestModel.countDocuments();
    const protocolNumber = String(count + 1).padStart(5, '0');
    const protocol = `APP-${currentYear}-${protocolNumber}`;

    const request = new this.requestModel({
      protocol,
      tenantId: new Types.ObjectId(dto.tenantId),
      departmentId: new Types.ObjectId(dto.departmentId),
      categoryId: new Types.ObjectId(dto.categoryId),
      subcategoryId: dto.subcategoryId,
      authorId: new Types.ObjectId(authorId),
      title: dto.title,
      description: dto.description,
      priority,
      status: RequestStatus.PENDING,
      location: {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude], // GeoJSON order: [lng, lat]
      },
      address: dto.address,
      media: dto.media || [],
    });

    const saved = await request.save();

    // Create initial history entry
    const history = new this.statusHistoryModel({
      requestId: saved._id,
      tenantId: saved.tenantId,
      status: RequestStatus.PENDING,
      changedById: new Types.ObjectId(authorId),
      comment: 'Solicitação registrada pelo cidadão.',
      evidenceMedia: [],
    });
    await history.save();

    return this.findById(saved._id.toString());
  }

  async findAll(filter: FilterRequestsDto, currentTenantId?: string) {
    const query: any = { isDeleted: false };

    const tenant = filter.tenantId || currentTenantId;
    if (tenant) {
      query.tenantId = new Types.ObjectId(tenant);
    }

    if (filter.departmentId) query.departmentId = new Types.ObjectId(filter.departmentId);
    if (filter.categoryId) query.categoryId = new Types.ObjectId(filter.categoryId);
    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;
    if (filter.authorId) query.authorId = new Types.ObjectId(filter.authorId);
    if (filter.assignedToUserId) query.assignedToUserId = new Types.ObjectId(filter.assignedToUserId);
    if (filter.neighborhood) {
      query['address.neighborhood'] = { $regex: filter.neighborhood, $options: 'i' };
    }

    if (filter.search) {
      query.$or = [
        { protocol: { $regex: filter.search, $options: 'i' } },
        { title: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
        { 'address.street': { $regex: filter.search, $options: 'i' } },
        { 'address.neighborhood': { $regex: filter.search, $options: 'i' } },
      ];
    }

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    let sort: any = { createdAt: -1 };
    if (filter.sortBy === 'supportsCount') {
      sort = { supportsCount: filter.sortOrder === 'asc' ? 1 : -1, createdAt: -1 };
    } else if (filter.sortBy) {
      sort = { [filter.sortBy]: filter.sortOrder === 'asc' ? 1 : -1 };
    }

    const [items, total] = await Promise.all([
      this.requestModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('tenantId', 'name slug city state logoUrl')
        .populate('departmentId', 'name slug icon')
        .populate('categoryId', 'name slug icon color slaHours')
        .populate('authorId', 'name avatarUrl')
        .populate('assignedToUserId', 'name avatarUrl')
        .lean(),
      this.requestModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findForMap(filter: MapRequestsFilterDto) {
    const query: any = { isDeleted: false };

    if (filter.tenantId) {
      query.tenantId = new Types.ObjectId(filter.tenantId);
    }
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.categoryId) {
      query.categoryId = new Types.ObjectId(filter.categoryId);
    }

    // Geospatial filter if lat & lng are supplied
    if (filter.lat && filter.lng) {
      const radiusInMeters = (filter.radiusKm || 15) * 1000;
      query.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [filter.lng, filter.lat],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

    return this.requestModel
      .find(query)
      .limit(200)
      .select('protocol title status priority location address media supportsCount commentsCount createdAt departmentId categoryId')
      .populate('departmentId', 'name icon')
      .populate('categoryId', 'name icon color')
      .lean();
  }

  async findById(id: string) {
    let request: any;
    if (Types.ObjectId.isValid(id)) {
      request = await this.requestModel
        .findById(id)
        .populate('tenantId', 'name slug city state logoUrl contactEmail contactPhone')
        .populate('departmentId', 'name slug icon contactEmail')
        .populate('categoryId', 'name slug icon color slaHours')
        .populate('authorId', 'name avatarUrl')
        .populate('assignedToUserId', 'name avatarUrl email')
        .lean();
    } else {
      // Find by protocol (e.g. APP-2026-00001)
      request = await this.requestModel
        .findOne({ protocol: id.toUpperCase() })
        .populate('tenantId', 'name slug city state logoUrl contactEmail contactPhone')
        .populate('departmentId', 'name slug icon contactEmail')
        .populate('categoryId', 'name slug icon color slaHours')
        .populate('authorId', 'name avatarUrl')
        .populate('assignedToUserId', 'name avatarUrl email')
        .lean();
    }

    if (!request) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    // Increment views count asynchronously
    this.requestModel.updateOne({ _id: request._id }, { $inc: { viewsCount: 1 } }).exec();

    // Fetch status history
    const history = await this.statusHistoryModel
      .find({ requestId: request._id })
      .sort({ createdAt: 1 })
      .populate('changedById', 'name avatarUrl role')
      .lean();

    return {
      ...request,
      statusHistory: history,
    };
  }

  async updateStatus(
    id: string,
    changedById: string,
    dto: UpdateStatusDto,
  ) {
    const request = await this.requestModel.findById(id);
    if (!request) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    request.status = dto.status;
    if (dto.assignedToUserId) {
      request.assignedToUserId = new Types.ObjectId(dto.assignedToUserId);
    }

    if (dto.status === RequestStatus.RESOLVED) {
      request.resolvedAt = new Date();
      if (dto.evidenceMedia && dto.evidenceMedia.length > 0) {
        request.resolutionMedia = dto.evidenceMedia as any;
      }
      if (dto.comment) {
        request.resolutionNotes = dto.comment;
      }
    }

    await request.save();

    // Save history entry
    const history = new this.statusHistoryModel({
      requestId: request._id,
      tenantId: request.tenantId,
      status: dto.status,
      changedById: new Types.ObjectId(changedById),
      comment: dto.comment || `Status atualizado para ${dto.status}`,
      evidenceMedia: dto.evidenceMedia || [],
    });
    await history.save();

    // Notify Author
    if (request.authorId.toString() !== changedById) {
      const statusLabels: Record<string, string> = {
        PENDING: 'Pendente',
        IN_REVIEW: 'Em análise',
        IN_PROGRESS: 'Em atendimento',
        RESOLVED: 'Resolvida',
        REJECTED: 'Recusada',
        CANCELLED: 'Cancelada',
      };
      await this.notificationModel.create({
        userId: request.authorId,
        tenantId: request.tenantId,
        title: `Atualização na solicitação ${request.protocol}`,
        message: `Sua solicitação agora está com o status: ${statusLabels[dto.status] || dto.status}.`,
        type: NotificationType.STATUS_CHANGE,
        link: `/requests/${request.protocol}`,
        read: false,
      });
    }

    return this.findById(request._id.toString());
  }

  async delete(id: string, userId: string, isStaffOrAdmin: boolean) {
    const request = await this.requestModel.findById(id);
    if (!request) throw new NotFoundException('Solicitação não encontrada.');

    if (!isStaffOrAdmin) {
      if (request.authorId.toString() !== userId) {
        throw new ForbiddenException('Você não tem permissão para excluir esta solicitação.');
      }
      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException('Apenas solicitações com status Pendente podem ser canceladas pelo cidadão.');
      }
    }

    request.isDeleted = true;
    await request.save();

    return { message: 'Solicitação removida com sucesso.' };
  }
}
