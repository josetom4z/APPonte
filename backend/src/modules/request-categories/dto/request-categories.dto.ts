import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { RequestPriority } from '../../../common/enums';

export class SubcategoryDto {
  @ApiProperty({ example: 'Buraco na pista' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'buraco-na-pista' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  active?: boolean = true;
}

export class CreateCategoryDto {
  @ApiProperty({ example: '65f123456789abcdef123456' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: '65f123456789abcdef123457' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ example: 'Vias Públicas e Pavimentação' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'vias-publicas' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Buracos, calçadas quebradas, lombadas e pavimentação asfáltica' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'traffic-cone' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#f59e0b' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ enum: RequestPriority, default: RequestPriority.MEDIUM })
  @IsOptional()
  @IsEnum(RequestPriority)
  defaultPriority?: RequestPriority;

  @ApiPropertyOptional({ example: 72, default: 72 })
  @IsOptional()
  @IsInt()
  @Min(1)
  slaHours?: number = 72;

  @ApiPropertyOptional({ type: [SubcategoryDto] })
  @IsOptional()
  @IsArray()
  subcategories?: SubcategoryDto[];
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ enum: RequestPriority })
  @IsOptional()
  @IsEnum(RequestPriority)
  defaultPriority?: RequestPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  slaHours?: number;

  @ApiPropertyOptional({ type: [SubcategoryDto] })
  @IsOptional()
  @IsArray()
  subcategories?: SubcategoryDto[];

  @ApiPropertyOptional()
  @IsOptional()
  active?: boolean;
}
