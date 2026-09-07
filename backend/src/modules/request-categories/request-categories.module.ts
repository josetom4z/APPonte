import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestCategoriesController } from './request-categories.controller';
import { RequestCategoriesService } from './request-categories.service';
import { RequestCategory, RequestCategorySchema } from '../../database/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestCategory.name, schema: RequestCategorySchema },
    ]),
  ],
  controllers: [RequestCategoriesController],
  providers: [RequestCategoriesService],
  exports: [RequestCategoriesService],
})
export class RequestCategoriesModule {}
