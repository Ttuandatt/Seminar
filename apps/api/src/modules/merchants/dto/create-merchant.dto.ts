import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateMerchantDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    shopName: string;

    @IsString()
    @IsOptional()
    shopAddress?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
