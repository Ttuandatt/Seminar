import { Type } from 'class-transformer';
import {
    IsArray,
    IsIn,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class AddressDto {
    @IsOptional()
    @IsString()
    line1?: string;

    @IsOptional()
    @IsString()
    line2?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;
}

export class OpeningHourDto {
    @IsString()
    day!: string;

    @IsString()
    open!: string;

    @IsString()
    close!: string;
}

export class ShopDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OpeningHourDto)
    openingHours?: OpeningHourDto[];
}

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    birthDate?: string;

    @IsOptional()
    @IsString()
    @IsIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_SAY'])
    gender?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    address?: AddressDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ShopDto)
    shop?: ShopDto;
}
