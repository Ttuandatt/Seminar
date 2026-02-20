import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'Password must contain uppercase, lowercase, and numeric characters',
    })
    password: string;

    @IsString()
    @MinLength(2)
    fullName: string;

    @IsEnum(Role)
    role: Role;

    // Shop Owner fields
    @IsOptional()
    @IsString()
    shopName?: string;

    @IsOptional()
    @IsString()
    phone?: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class RefreshTokenDto {
    @IsString()
    refreshToken: string;
}
