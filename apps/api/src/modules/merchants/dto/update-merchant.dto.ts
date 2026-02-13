import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateMerchantDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    shopName?: string;

    @IsString()
    @IsOptional()
    shopAddress?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;
}
