import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoutingDto {
  @IsOptional()
  @IsInt()
  pricelist_id?: number | null;

  @IsInt()
  routes_id: number;

  @IsString()
  @MaxLength(20)
  percentage: string;

  @IsOptional()
  @IsInt()
  call_count?: number;

  @IsOptional()
  @IsInt()
  quality_base?: number | null;
}
