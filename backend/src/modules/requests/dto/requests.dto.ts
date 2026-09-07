import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RequestStatus, RequestPriority, MediaType } from '../../../common/enums';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class MediaItemDto {
  @ApiProperty({ example: '/uploads/file-123456.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ enum: MediaType, default: MediaType.IMAGE })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType = MediaType.IMAGE;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  size?: number;
}

export class AddressDto {
  @ApiProperty({ example: 'Av. Brasil, 1500' })
  @IsString()
  @IsNotEmpty()
  formattedAddress: string;

  @ApiPropertyOptional({ example: 'Av. Brasil' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: '1500' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({ example: 'Nova Esperança' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({ example: '14800-000' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'Em frente ao posto de saúde' })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class CreateRequestDto {
  @ApiProperty({ example: '65f123456789abcdef123456' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: '65f123456789abcdef123457' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ example: '65f123456789abcdef123458' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: 'buraco-na-via' })
  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @ApiProperty({ example: 'Buraco de grande porte na via principal' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Buraco profundo causando risco de acidentes e danos aos veículos.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: RequestPriority, default: RequestPriority.MEDIUM })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiProperty({ example: -23.55052 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -46.633308 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ type: [MediaItemDto] })
  @IsOptional()
  @IsArray()
  media?: MediaItemDto[];
}

export class UpdateStatusDto {
  @ApiProperty({ enum: RequestStatus })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @ApiPropertyOptional({ example: 'Equipe de manutenção realizou o recapeamento asfáltico no local.' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ type: [MediaItemDto], description: 'Fotos/vídeos comprovando o serviço executado' })
  @IsOptional()
  @IsArray()
  evidenceMedia?: MediaItemDto[];

  @ApiPropertyOptional({ description: 'Atribuir a um operador específico' })
  @IsOptional()
  @IsString()
  assignedToUserId?: string;
}

export class FilterRequestsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ enum: RequestPriority })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiPropertyOptional({ description: 'Filtrar por autor (Cidadão)' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por operador atribuído' })
  @IsOptional()
  @IsString()
  assignedToUserId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por bairro' })
  @IsOptional()
  @IsString()
  neighborhood?: string;
}

export class MapRequestsFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @ApiPropertyOptional({ default: 15 })
  @IsOptional()
  @Type(() => Number)
  radiusKm?: number = 15;
}
