import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MediaItemDto } from '../../requests/dto/requests.dto';

export class CreateCommentDto {
  @ApiProperty({ example: '65f123456789abcdef123456' })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({ example: 'Também notei esse problema hoje pela manhã. Está muito perigoso.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ type: [MediaItemDto] })
  @IsOptional()
  @IsArray()
  media?: MediaItemDto[];

  @ApiPropertyOptional({ default: false, description: 'Comentário interno visível apenas para a equipe da prefeitura' })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean = false;
}
