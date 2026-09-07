import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {
  Request,
  RequestSchema,
  User,
  UserSchema,
  Tenant,
  TenantSchema,
  Department,
  DepartmentSchema,
  Advertisement,
  AdvertisementSchema,
} from '../../database/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Advertisement.name, schema: AdvertisementSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
