import {
    IsString,
    IsOptional,
    IsNumber,
    IsEnum,
    IsInt,
    Min,
    Max,
    MinLength,
    IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PoiCategory, PoiStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto';

export class CreatePoiDto {
    @IsString()
    @MinLength(2)
    nameVi: string;

    @IsOptional()
    @IsString()
    nameEn?: string;

    @IsString()
    @MinLength(10)
    descriptionVi: string;

    @IsOptional()
    @IsString()
    descriptionEn?: string;

    @Type(() => Number)
    @IsNumber()
    latitude: number;

    @Type(() => Number)
    @IsNumber()
    longitude: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(5)
    @Max(100)
    triggerRadius?: number;

    @IsOptional()
    @IsEnum(PoiCategory)
    category?: PoiCategory;

    @IsOptional()
    @IsEnum(PoiStatus)
    status?: PoiStatus;

    @IsOptional()
    @IsUUID()
    ownerId?: string | null;
}

export class UpdatePoiDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    nameVi?: string;

    @IsOptional()
    @IsString()
    nameEn?: string;

    @IsOptional()
    @IsString()
    descriptionVi?: string;

    @IsOptional()
    @IsString()
    descriptionEn?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(5)
    @Max(100)
    triggerRadius?: number;

    @IsOptional()
    @IsEnum(PoiCategory)
    category?: PoiCategory;

    @IsOptional()
    @IsEnum(PoiStatus)
    status?: PoiStatus;

    @IsOptional()
    @IsUUID()
    ownerId?: string | null;
}

export class QueryPoiDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(PoiCategory)
    category?: PoiCategory;

    @IsOptional()
    @IsEnum(PoiStatus)
    status?: PoiStatus;
}
