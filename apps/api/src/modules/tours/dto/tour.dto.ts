import {
    IsString,
    IsOptional,
    IsInt,
    IsArray,
    MinLength,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TourStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto';

export class CreateTourDto {
    @IsString()
    @MinLength(2)
    nameVi: string;

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
    @IsInt()
    estimatedDuration?: number;
}

export class UpdateTourDto {
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
    @IsInt()
    estimatedDuration?: number;

    @IsOptional()
    @IsEnum(TourStatus)
    status?: TourStatus;
}

export class SetTourPoisDto {
    @IsArray()
    @IsString({ each: true })
    poiIds: string[];
}

export class QueryTourDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(TourStatus)
    status?: TourStatus;
}
