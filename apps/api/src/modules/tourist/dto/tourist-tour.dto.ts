import { IsString, IsOptional, IsArray, IsUUID, MinLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateTouristTourDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMinSize(2)
    @ArrayMaxSize(15)
    poiIds: string[];
}

export class UpdateTouristTourDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMinSize(2)
    @ArrayMaxSize(15)
    poiIds?: string[];
}
