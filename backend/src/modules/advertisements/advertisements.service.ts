import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Advertisement, AdvertisementDocument } from '../../database/schemas';
import { CreateAdvertisementDto, FilterAdsDto } from './dto/advertisements.dto';
import { AdPlacement, AdStatus } from '../../common/enums';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectModel(Advertisement.name)
    private adModel: Model<AdvertisementDocument>,
  ) {}

  async create(dto: CreateAdvertisementDto) {
    const ad = new this.adModel({
      ...dto,
      tenantId: dto.tenantId ? new Types.ObjectId(dto.tenantId) : undefined,
      targetCategoryId: dto.targetCategoryId ? new Types.ObjectId(dto.targetCategoryId) : undefined,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: AdStatus.ACTIVE,
    });
    return ad.save();
  }

  async serveAds(placement: AdPlacement, tenantId?: string, limit = 3) {
    const now = new Date();
    const query: any = {
      placement,
      status: AdStatus.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (tenantId) {
      query.$or = [
        { tenantId: new Types.ObjectId(tenantId) },
        { tenantId: null },
        { tenantId: { $exists: false } },
      ];
    }

    const ads = await this.adModel
      .find(query)
      .limit(limit)
      .sort({ impressionsCount: 1 }) // Balance impression distribution
      .lean();

    // Increment impression count asynchronously
    if (ads.length > 0) {
      const ids = ads.map((a) => a._id);
      this.adModel.updateMany({ _id: { $in: ids } }, { $inc: { impressionsCount: 1 } }).exec();
    }

    return ads;
  }

  async trackClick(id: string) {
    const ad = await this.adModel.findByIdAndUpdate(
      id,
      { $inc: { clicksCount: 1 } },
      { new: true },
    );
    if (!ad) throw new NotFoundException('Anúncio não encontrado.');
    return { success: true, targetUrl: ad.targetUrl, clicksCount: ad.clicksCount };
  }

  async findAll(filter: FilterAdsDto) {
    const query: any = {};

    if (filter.placement) query.placement = filter.placement;
    if (filter.status) query.status = filter.status;
    if (filter.tenantId) query.tenantId = new Types.ObjectId(filter.tenantId);

    if (filter.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: 'i' } },
        { advertiserName: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.adModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('tenantId', 'name city')
        .lean(),
      this.adModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(id: string) {
    const ad = await this.adModel.findByIdAndDelete(id);
    if (!ad) throw new NotFoundException('Anúncio não encontrado.');
    return { message: 'Anúncio removido.' };
  }
}
