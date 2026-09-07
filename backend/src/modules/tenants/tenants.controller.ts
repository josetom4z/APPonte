import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto, FilterTenantsDto } from './dto/tenants.dto';
import { Public, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Role } from '../../common/enums';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('active-cities')
  @Public()
  @ApiOperation({ summary: 'Listar prefeituras e cidades ativas disponíveis' })
  findActiveCities() {
    return this.tenantsService.findActiveCities();
  }

  @Get('by-slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Obter dados públicos da prefeitura por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar nova prefeitura (SuperAdmin)' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas as prefeituras cadastradas' })
  findAll(@Query() filter: FilterTenantsDto) {
    return this.tenantsService.findAll(filter);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obter prefeitura por ID' })
  findById(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados ou configurações da prefeitura' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }
}
