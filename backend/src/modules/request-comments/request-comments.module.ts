import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestCommentsController } from './request-comments.controller';
import { RequestCommentsService } from './request-comments.service';
import {
  RequestComment,
  RequestCommentSchema,
  Request,
  RequestSchema,
  Notification,
  NotificationSchema,
} from '../../database/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestComment.name, schema: RequestCommentSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [RequestCommentsController],
  providers: [RequestCommentsService],
  exports: [RequestCommentsService],
})
export class RequestCommentsModule {}
