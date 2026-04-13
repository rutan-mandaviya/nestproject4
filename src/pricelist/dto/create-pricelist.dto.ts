import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePricelistDto {
  @IsString()
  @MaxLength(30)
  name: string;

  @IsString()
  @MaxLength(50)
  markup: string;

  @IsInt()
  routing_type: number;

  @IsInt()
  initially_increment: number;

  @IsInt()
  inc: number;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsInt()
  reseller_id?: number;
}
