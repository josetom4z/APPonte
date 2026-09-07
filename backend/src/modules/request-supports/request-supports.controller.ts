import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestSupportsService } from './request-supports.service';
import { CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';

@ApiTags('Request Supports')
@Controller('request-supports')
export class RequestSupportsController {
  constructor(private readonly supportsService: RequestSupportsService) {}

  @Post(':requestId/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apoiar ou remover apoio de uma solicitação (Cidadão)' })
  toggleSupport(
    @Param('requestId') requestId: string,
    @CurrentUser('_id') userId: string,
  ) {
    return this.supportsService.toggleSupport(requestId, userId);
  }

  @Get(':requestId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar se o usuário atual já apoiou a solicitação' })
  checkSupported(
    @Param('requestId') requestId: string,
    @CurrentUser('_id') userId: string,
  ) {
    return this.supportsService.checkUserSupported(requestId, userId);
  }

  @Get('my-supports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar IDs de todas as solicitações apoiadas pelo usuário atual' })
  getMySupports(@CurrentUser('_id') userId: string) {
    return this.supportsService.getUserSupports(userId);
  }
}
