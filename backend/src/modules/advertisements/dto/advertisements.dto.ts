import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AdPlacement, AdStatus } from '../../../common/enums';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateAdvertisementDto {
  @ApiPropertyOptional({ description: 'ID da prefeitura alvo (opcional para anúncios globais)' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ example: 'Supermercado Central' })
  @IsString()
  @IsNotEmpty()
  advertiserName: string;

  @ApiPropertyOptional({ example: 'contato@supercentral.com.br' })
  @IsOptional()
  @IsString()
  advertiserContact?: string;

  @ApiProperty({ example: 'Grande Oferta de Inauguração' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Descontos de até 40% em produtos de feira e açougue nesta semana!' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '/uploads/ad-banner.jpg' })
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiProperty({ example: 'https://supercentral.com.br' })
  @IsString()
  @IsNotEmpty()
  targetUrl: string;

  @ApiProperty({ enum: AdPlacement, default: AdPlacement.FEED })
  @IsEnum(AdPlacement)
  placement: AdPlacement;

  @ApiPropertyOptional({ example: 'Nova Esperança' })
  @IsOptional()
  @IsString()
  targetCity?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  targetState?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetCategoryId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  budget?: number = 0;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  @IsDateString()
  endDate: string;
}

export class FilterAdsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AdPlacement })
  @IsOptional()
  @IsEnum(AdPlacement)
  placement?: AdPlacement;

  @ApiPropertyOptional({ enum: AdStatus })
  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tenantId?: string;
}
