import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, ValidateNested, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { NarrationType } from '@prisma/client';

export class NarrationItemDto {
  @IsEnum(NarrationType)
  @IsNotEmpty()
  type: NarrationType;

  @IsNumber()
  @IsNotEmpty()
  orderIndex: number;

  @IsOptional()
  @IsString()
  fromPoiId?: string | null;

  @IsOptional()
  @IsString()
  toPoiId?: string | null;

  @IsOptional()
  @IsString()
  scriptVi?: string | null;

  @IsOptional()
  @IsString()
  scriptEn?: string | null;
}

export class UpsertNarrationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NarrationItemDto)
  narrations: NarrationItemDto[];
}
