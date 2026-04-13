import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { CallType } from './model/calltype.model';
import { CreateCallTypeDto } from './dto/create-calltype.dto';
import { UpdateCallTypeDto } from './dto/update-calltype.dto';

@Injectable()
export class CallTypeService {
  constructor(
    @InjectModel(CallType)
    private callTypeModel: typeof CallType,
  ) {}

  async create(dto: CreateCallTypeDto) {
    return this.callTypeModel.create({ ...dto } as Partial<CallType>);
  }

  async findAll() {
    return this.callTypeModel.findAll();
  }

  async findOne(id: number) {
    const callType = await this.callTypeModel.findByPk(id);

    if (!callType) {
      throw new NotFoundException('CallType not found');
    }

    return callType;
  }

  async update(id: number, dto: UpdateCallTypeDto) {
    const callType = await this.findOne(id);
    await callType.update({ ...dto } as Partial<CallType>);
    return callType;
  }

  async remove(id: number) {
    const callType = await this.findOne(id);

    await callType.destroy();

    return { message: 'CallType deleted successfully' };
  }
}
