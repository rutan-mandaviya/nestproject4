import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRatedeckDto {
  @IsString()
  @MaxLength(80)
  destination: string;

  @IsInt()
  country_id: number;

  @IsString()
  @MaxLength(40)
  pattern: string;

  @IsInt()
  call_type: number;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsInt()
  reseller_id?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  creation_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  last_modified_date?: Date;
}
