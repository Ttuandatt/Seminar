import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class GenerateTranslatedTtsDto {
    @IsString()
    @MinLength(10, { message: 'Text quá ngắn, cần ít nhất 10 ký tự' })
    @MaxLength(5000, { message: 'Text quá dài, tối đa 5000 ký tự' })
    text: string;

    @IsString()
    targetLanguage: string; // e.g. 'EN', 'JA', 'KO', 'ZH-CN'

    @IsOptional()
    @IsString()
    sourceLanguage?: string; // defaults to 'VI'

    @IsOptional()
    @IsString()
    voice?: string;
}
