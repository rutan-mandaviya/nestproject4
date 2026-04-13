import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCallTypeDto {
  @IsString()
  @MaxLength(255)
  call_type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  status?: number;
}
