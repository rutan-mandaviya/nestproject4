import { PartialType } from '@nestjs/mapped-types';
import { CreateRatedeckDto } from './create-ratedeck.dto';

export class UpdateRatedeckDto extends PartialType(CreateRatedeckDto) {}
