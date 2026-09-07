import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto, FilterAdsDto } from './dto/advertisements.dto';
import { Public, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { AdPlacement, Role } from '../../common/enums';

@ApiTags('Advertisements')
@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly adsService: AdvertisementsService) {}

  @Get('serve')
  @Public()
  @ApiOperation({ summary: 'Obter anúncios ativos para exibição em uma determinada área (Feed, Sidebar, Mapa, etc.)' })
  serve(
    @Query('placement') placement: AdPlacement = AdPlacement.FEED,
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit = 3,
  ) {
    return this.adsService.serveAds(placement, tenantId, Number(limit));
  }

  @Post(':id/click')
  @Public()
  @ApiOperation({ summary: 'Registrar clique no anúncio e obter URL de destino' })
  trackClick(@Param('id') id: string) {
    return this.adsService.trackClick(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar novo anúncio publicitário' })
  create(@Body() dto: CreateAdvertisementDto) {
    return this.adsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar anúncios cadastrados com métricas (Admin)' })
  findAll(@Query() filter: FilterAdsDto) {
    return this.adsService.findAll(filter);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir anúncio' })
  delete(@Param('id') id: string) {
    return this.adsService.delete(id);
  }
}
