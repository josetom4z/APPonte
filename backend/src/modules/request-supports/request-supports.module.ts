import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestSupportsController } from './request-supports.controller';
import { RequestSupportsService } from './request-supports.service';
import {
  RequestSupport,
  RequestSupportSchema,
  Request,
  RequestSchema,
} from '../../database/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestSupport.name, schema: RequestSupportSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
  ],
  controllers: [RequestSupportsController],
  providers: [RequestSupportsService],
  exports: [RequestSupportsService],
})
export class RequestSupportsModule {}
