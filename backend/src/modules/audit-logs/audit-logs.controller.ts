import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Role } from '../../common/enums';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar trilhas de auditoria (Admin/SuperAdmin)' })
  findAll(
    @CurrentUser('tenantId') currentTenantId: string,
    @CurrentUser('role') role: Role,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const tenantId = role === Role.SUPER_ADMIN ? queryTenantId : currentTenantId;
    return this.auditService.findAll(tenantId);
  }
}
