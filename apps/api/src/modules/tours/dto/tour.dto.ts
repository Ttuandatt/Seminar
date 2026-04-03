import {
    IsString,
    IsOptional,
    IsInt,
    IsArray,
    MinLength,
    IsIn,
    IsBoolean,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

export const TOUR_STATUS_INPUTS = ['DRAFT', 'PUBLISHED', 'ACTIVE', 'ARCHIVED'] as const;
export type TourStatusInput = (typeof TOUR_STATUS_INPUTS)[number];

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

    @IsOptional()
    @IsIn(TOUR_STATUS_INPUTS)
    status?: TourStatusInput;
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
    @IsIn(TOUR_STATUS_INPUTS)
    status?: TourStatusInput;
}

export class SetTourPoisDto {
    @IsArray()
    @IsString({ each: true })
    poiIds: string[];
}

export class CreateTourStopDto {
    @IsUUID()
    poiId: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    orderIndex?: number;

    @IsOptional()
    @IsString()
    titleOverride?: string;

    @IsOptional()
    @IsString()
    descriptionOverride?: string;

    @IsOptional()
    @IsString()
    customIntro?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    estimatedStayMinutes?: number;

    @IsOptional()
    @IsString()
    transitionNote?: string;

    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;

    @IsOptional()
    @IsString()
    unlockRule?: string;
}

export class UpdateTourStopDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    orderIndex?: number;

    @IsOptional()
    @IsString()
    titleOverride?: string;

    @IsOptional()
    @IsString()
    descriptionOverride?: string;

    @IsOptional()
    @IsString()
    customIntro?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    estimatedStayMinutes?: number;

    @IsOptional()
    @IsString()
    transitionNote?: string;

    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;

    @IsOptional()
    @IsString()
    unlockRule?: string;
}

export class TourStopOrderItemDto {
    @IsUUID()
    id: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    orderIndex: number;
}

export class ReorderTourStopsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TourStopOrderItemDto)
    items: TourStopOrderItemDto[];
}

export class QueryTourDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(TOUR_STATUS_INPUTS)
    status?: TourStatusInput;
}
