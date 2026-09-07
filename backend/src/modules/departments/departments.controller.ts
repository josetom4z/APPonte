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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/departments.dto';
import { Public, Roles, CurrentUser } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Role } from '../../common/enums';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get('by-tenant/:tenantId')
  @Public()
  @ApiOperation({ summary: 'Listar todas as secretarias de um tenant' })
  findByTenant(@Param('tenantId') tenantId: string) {
    return this.departmentsService.findByTenant(tenantId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obter detalhes de uma secretaria' })
  findById(@Param('id') id: string) {
    return this.departmentsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova secretaria' })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SECRETARY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados da secretaria' })
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }
}
