import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MaxLength(40)
  pattern: string;

  @IsNumber()
  cost: number;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsInt()
  callTypeId: number;

  @IsInt()
  pricelistId: number;
}

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  pattern?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsInt()
  callTypeId?: number;

  @IsOptional()
  @IsInt()
  pricelistId?: number;
}
