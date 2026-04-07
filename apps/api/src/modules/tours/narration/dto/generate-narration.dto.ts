import { IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { NarrationType } from '@prisma/client';

export class GenerateNarrationDto {
  @IsOptional()
  @IsArray()
  @IsEnum(NarrationType, { each: true })
  types?: NarrationType[];

  @IsOptional()
  @IsBoolean()
  overwriteExisting?: boolean;
}
