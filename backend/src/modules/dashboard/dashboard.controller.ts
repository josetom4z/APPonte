import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Role } from '../../common/enums';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('public-stats')
  @Public()
  @ApiOperation({ summary: 'Estatísticas públicas para a Landing Page' })
  getPublicStats() {
    return this.dashboardService.getPlatformStats();
  }

  @Get('citizen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Métricas e resumo para o Painel do Cidadão' })
  getCitizenDashboard(@CurrentUser('_id') userId: string) {
    return this.dashboardService.getCitizenDashboard(userId);
  }

  @Get('operator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OPERATOR, Role.SECRETARY, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Métricas e fila de tarefas para o Atuante (Operador)' })
  getOperatorDashboard(
    @CurrentUser('_id') userId: string,
    @CurrentUser('departmentId') departmentId: string,
  ) {
    return this.dashboardService.getOperatorDashboard(userId, departmentId);
  }

  @Get('secretary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SECRETARY, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Métricas, gráficos e desempenho para o Secretário' })
  getSecretaryDashboard(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('departmentId') departmentId: string,
  ) {
    return this.dashboardService.getSecretaryDashboard(tenantId, departmentId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Visão executiva e indicadores gerais para Administradores' })
  getAdminDashboard(
    @CurrentUser('tenantId') currentTenantId: string,
    @CurrentUser('role') role: Role,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const tenantId = role === Role.SUPER_ADMIN ? queryTenantId : currentTenantId;
    return this.dashboardService.getAdminDashboard(tenantId);
  }
}
