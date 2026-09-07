import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RequestComment,
  RequestCommentDocument,
  Request,
  RequestDocument,
  Notification,
  NotificationDocument,
} from '../../database/schemas';
import { CreateCommentDto } from './dto/request-comments.dto';
import { NotificationType } from '../../common/enums';

@Injectable()
export class RequestCommentsService {
  constructor(
    @InjectModel(RequestComment.name)
    private commentModel: Model<RequestCommentDocument>,
    @InjectModel(Request.name)
    private requestModel: Model<RequestDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(authorId: string, dto: CreateCommentDto) {
    const request = await this.requestModel.findById(dto.requestId);
    if (!request) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    const comment = new this.commentModel({
      requestId: request._id,
      tenantId: request.tenantId,
      authorId: new Types.ObjectId(authorId),
      content: dto.content,
      media: dto.media || [],
      isInternal: dto.isInternal || false,
    });

    const saved = await comment.save();

    // Increment comments count on request
    await this.requestModel.updateOne(
      { _id: request._id },
      { $inc: { commentsCount: 1 } },
    );

    // Send notification to the request author if the commenter is another person
    if (request.authorId.toString() !== authorId && !dto.isInternal) {
      await this.notificationModel.create({
        userId: request.authorId,
        tenantId: request.tenantId,
        title: `Novo comentário na sua solicitação ${request.protocol}`,
        message: dto.content.length > 80 ? `${dto.content.substring(0, 80)}...` : dto.content,
        type: NotificationType.NEW_COMMENT,
        link: `/requests/${request.protocol}`,
        read: false,
      });
    }

    return this.commentModel
      .findById(saved._id)
      .populate('authorId', 'name avatarUrl role')
      .lean();
  }

  async findByRequest(requestId: string, includeInternal = false) {
    const query: any = {
      requestId: new Types.ObjectId(requestId),
      isDeleted: false,
    };

    if (!includeInternal) {
      query.isInternal = false;
    }

    return this.commentModel
      .find(query)
      .sort({ createdAt: 1 })
      .populate('authorId', 'name avatarUrl role')
      .lean();
  }

  async delete(commentId: string, userId: string, isStaffOrAdmin: boolean) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comentário não encontrado.');

    if (!isStaffOrAdmin && comment.authorId.toString() !== userId) {
      throw new NotFoundException('Permissão negada.');
    }

    comment.isDeleted = true;
    await comment.save();

    await this.requestModel.updateOne(
      { _id: comment.requestId },
      { $inc: { commentsCount: -1 } },
    );

    return { message: 'Comentário removido.' };
  }
}
