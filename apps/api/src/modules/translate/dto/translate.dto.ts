import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class TranslateDto {
    @IsString()
    @MinLength(1, { message: 'Text cannot be empty' })
    @MaxLength(10000, { message: 'Text too long, max 10000 characters' })
    text: string;

    @IsString()
    from: string; // e.g. 'vi', 'en', 'auto'

    @IsString()
    to: string; // e.g. 'en', 'vi', 'ja', 'ko', 'zh', 'fr', etc.
}

export class TranslateBatchDto {
    @IsString({ each: true })
    @MinLength(1, { each: true })
    texts: string[];

    @IsString()
    from: string;

    @IsString()
    to: string;
}
