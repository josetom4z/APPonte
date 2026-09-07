import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RequestSupport,
  RequestSupportDocument,
  Request,
  RequestDocument,
} from '../../database/schemas';

@Injectable()
export class RequestSupportsService {
  constructor(
    @InjectModel(RequestSupport.name)
    private supportModel: Model<RequestSupportDocument>,
    @InjectModel(Request.name)
    private requestModel: Model<RequestDocument>,
  ) {}

  async toggleSupport(requestId: string, userId: string) {
    const request = await this.requestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    const existing = await this.supportModel.findOne({
      requestId: request._id,
      userId: new Types.ObjectId(userId),
    });

    let supported = false;

    if (existing) {
      await this.supportModel.deleteOne({ _id: existing._id });
      await this.requestModel.updateOne(
        { _id: request._id },
        { $inc: { supportsCount: -1 } },
      );
      supported = false;
    } else {
      await this.supportModel.create({
        requestId: request._id,
        userId: new Types.ObjectId(userId),
        tenantId: request.tenantId,
      });
      await this.requestModel.updateOne(
        { _id: request._id },
        { $inc: { supportsCount: 1 } },
      );
      supported = true;
    }

    const updated = await this.requestModel.findById(requestId, 'supportsCount');
    return {
      supported,
      supportsCount: updated?.supportsCount || 0,
    };
  }

  async checkUserSupported(requestId: string, userId: string) {
    if (!userId) return { supported: false };
    const existing = await this.supportModel.findOne({
      requestId: new Types.ObjectId(requestId),
      userId: new Types.ObjectId(userId),
    });
    return { supported: !!existing };
  }

  async getUserSupports(userId: string) {
    const supports = await this.supportModel
      .find({ userId: new Types.ObjectId(userId) })
      .select('requestId')
      .lean();
    return supports.map((s) => s.requestId.toString());
  }
}
