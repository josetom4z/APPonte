import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SaasPlansService } from './saas-plans.service';
import { Public, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Role } from '../../common/enums';

@ApiTags('SaaS Plans')
@Controller('plans')
export class SaasPlansController {
  constructor(private readonly plansService: SaasPlansService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar planos disponíveis da plataforma' })
  getPlans() {
    return this.plansService.getPublicPlans();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo plano SaaS (SuperAdmin)' })
  createPlan(@Body() data: any) {
    return this.plansService.createPlan(data);
  }

  @Get('subscription/:tenantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter assinatura ativa do tenant' })
  getSubscription(@Param('tenantId') tenantId: string) {
    return this.plansService.getTenantSubscription(tenantId);
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assinar ou renovar plano SaaS para um tenant' })
  subscribe(@Body() body: { tenantId: string; planId: string; durationMonths?: number }) {
    return this.plansService.assignSubscription(body.tenantId, body.planId, body.durationMonths);
  }
}
