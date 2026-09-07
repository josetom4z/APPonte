import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestCommentsService } from './request-comments.service';
import { CreateCommentDto } from './dto/request-comments.dto';
import { CurrentUser, Public } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { Role } from '../../common/enums';

@ApiTags('Request Comments')
@Controller('request-comments')
export class RequestCommentsController {
  constructor(private readonly commentsService: RequestCommentsService) {}

  @Get('by-request/:requestId')
  @Public()
  @ApiOperation({ summary: 'Listar comentários de uma solicitação' })
  findByRequest(
    @Param('requestId') requestId: string,
    @CurrentUser('role') role?: Role,
  ) {
    const isStaff = role && [Role.OPERATOR, Role.SECRETARY, Role.ADMIN, Role.SUPER_ADMIN].includes(role);
    return this.commentsService.findByRequest(requestId, isStaff);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar comentário à solicitação' })
  create(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir comentário' })
  delete(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    const isStaffOrAdmin = [Role.ADMIN, Role.SUPER_ADMIN, Role.SECRETARY].includes(role);
    return this.commentsService.delete(id, userId, isStaffOrAdmin);
  }
}
