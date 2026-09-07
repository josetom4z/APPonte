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
import { RequestCategoriesService } from './request-categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/request-categories.dto';
import { Public, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Role } from '../../common/enums';

@ApiTags('Request Categories')
@Controller('request-categories')
export class RequestCategoriesController {
  constructor(private readonly categoriesService: RequestCategoriesService) {}

  @Get('by-tenant/:tenantId')
  @Public()
  @ApiOperation({ summary: 'Listar categorias de serviços de um tenant/prefeitura' })
  findByTenant(
    @Param('tenantId') tenantId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.categoriesService.findByTenant(tenantId, departmentId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obter detalhes de uma categoria' })
  findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SECRETARY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova categoria de serviço' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SECRETARY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar categoria de serviço' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }
}
