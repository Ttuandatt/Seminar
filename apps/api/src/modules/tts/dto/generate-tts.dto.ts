import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { MediaLanguage } from '@prisma/client';

export class GenerateTtsDto {
    @IsString()
    @MinLength(10, { message: 'Text quá ngắn, cần ít nhất 10 ký tự' })
    @MaxLength(5000, { message: 'Text quá dài, tối đa 5000 ký tự' })
    text: string;

    @IsEnum(MediaLanguage, { message: 'Ngôn ngữ không hợp lệ hoặc không được hỗ trợ' })
    language: MediaLanguage;

    @IsOptional()
    @IsString()
    voice?: string;
}
