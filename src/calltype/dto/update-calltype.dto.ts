import { PartialType } from '@nestjs/mapped-types';
import { CreateCallTypeDto } from './create-calltype.dto';

export class UpdateCallTypeDto extends PartialType(CreateCallTypeDto) {}
