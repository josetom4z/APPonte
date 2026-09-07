import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import {
  CreateRequestDto,
  UpdateStatusDto,
  FilterRequestsDto,
  MapRequestsFilterDto,
} from './dto/requests.dto';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Role } from '../../common/enums';

@ApiTags('Requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('map')
  @Public()
  @ApiOperation({ summary: 'Obter solicitações para exibição em mapa com suporte a raio de busca' })
  findForMap(@Query() filter: MapRequestsFilterDto) {
    return this.requestsService.findForMap(filter);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar feed de solicitações com paginação, filtros e ordenação' })
  findAll(
    @Query() filter: FilterRequestsDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.requestsService.findAll(filter, tenantId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obter detalhes da solicitação por ID ou Protocolo' })
  findById(@Param('id') id: string) {
    return this.requestsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova solicitação cidadã' })
  create(
    @CurrentUser('_id') authorId: string,
    @Body() dto: CreateRequestDto,
  ) {
    return this.requestsService.create(authorId, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OPERATOR, Role.SECRETARY, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status do atendimento (Atuante / Secretário / Admin)' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.requestsService.updateStatus(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir / cancelar solicitação' })
  delete(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    const isStaffOrAdmin = [Role.ADMIN, Role.SUPER_ADMIN, Role.SECRETARY].includes(role);
    return this.requestsService.delete(id, userId, isStaffOrAdmin);
  }
}
