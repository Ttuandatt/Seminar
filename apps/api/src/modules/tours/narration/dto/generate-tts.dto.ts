import { IsOptional, IsArray, IsString } from 'class-validator';

export class GenerateTtsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  narrationIds?: string[];
}
