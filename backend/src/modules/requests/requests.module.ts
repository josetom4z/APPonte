import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import {
  Request,
  RequestSchema,
  RequestStatusHistory,
  RequestStatusHistorySchema,
  RequestCategory,
  RequestCategorySchema,
  Notification,
  NotificationSchema,
} from '../../database/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: RequestStatusHistory.name, schema: RequestStatusHistorySchema },
      { name: RequestCategory.name, schema: RequestCategorySchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
