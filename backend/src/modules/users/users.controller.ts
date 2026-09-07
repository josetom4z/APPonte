import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, CreateUserAdminDto, FilterUsersDto } from './dto/users.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Role } from '../../common/enums';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('profile')
  @ApiOperation({ summary: 'Atualizar dados do perfil do usuário logado' })
  updateProfile(
    @CurrentUser('_id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SECRETARY)
  @ApiOperation({ summary: 'Criar novo usuário (Administrador/Secretário)' })
  createByAdmin(@Body() dto: CreateUserAdminDto) {
    return this.usersService.createByAdmin(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SECRETARY)
  @ApiOperation({ summary: 'Listar usuários com filtros e paginação' })
  findAll(
    @Query() filter: FilterUsersDto,
    @CurrentUser('tenantId') currentTenantId: string,
    @CurrentUser('role') role: Role,
  ) {
    // If role is not SUPER_ADMIN, enforce filtering by current user's tenant
    const tenantFilter = role === Role.SUPER_ADMIN ? filter.tenantId : currentTenantId;
    return this.usersService.findAll(filter, tenantFilter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um usuário por ID' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ativar, inativar ou bloquear usuário' })
  toggleStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.toggleStatus(id, status);
  }
}
