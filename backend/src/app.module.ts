import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { RequestCategoriesModule } from './modules/request-categories/request-categories.module';
import { RequestsModule } from './modules/requests/requests.module';
import { RequestCommentsModule } from './modules/request-comments/request-comments.module';
import { RequestSupportsModule } from './modules/request-supports/request-supports.module';
import { AdvertisementsModule } from './modules/advertisements/advertisements.module';
import { SaasPlansModule } from './modules/saas-plans/saas-plans.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/apponte',
        ),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120, // 120 requests per minute
      },
    ]),
    UploadsModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    DepartmentsModule,
    RequestCategoriesModule,
    RequestsModule,
    RequestCommentsModule,
    RequestSupportsModule,
    AdvertisementsModule,
    SaasPlansModule,
    NotificationsModule,
    DashboardModule,
    AuditLogsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
