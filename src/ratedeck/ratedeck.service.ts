import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRatedeckDto } from './dto/create-ratedeck.dto';
import { UpdateRatedeckDto } from './dto/update-ratedeck.dto';
import { Ratedeck } from './model/ratedeck.model';
import { CallType } from 'src/calltype/model/calltype.model';

@Injectable()
export class RatedeckService {
  constructor(
    @InjectModel(Ratedeck)
    private readonly ratedeckModel: typeof Ratedeck,
  ) {}

  async create(dto: CreateRatedeckDto): Promise<Ratedeck> {
    const now = new Date();

    const payload: Partial<Ratedeck> = {
      ...dto,
      creation_date: dto.creation_date ?? now,
      last_modified_date: dto.last_modified_date ?? now,
    };

    return this.ratedeckModel.create(payload);
  }

  async findAll(): Promise<Ratedeck[]> {
    return this.ratedeckModel.findAll({ include: [CallType] });
  }

  async findOne(id: number): Promise<Ratedeck> {
    const ratedeck = await this.ratedeckModel.findByPk(id, {
      include: [CallType],
    });

    if (!ratedeck) {
      throw new NotFoundException('Ratedeck not found');
    }

    return ratedeck;
  }

  async update(id: number, dto: UpdateRatedeckDto): Promise<Ratedeck> {
    const ratedeck = await this.findOne(id);

    await ratedeck.update({
      ...dto,
      last_modified_date: new Date(),
    } as Partial<Ratedeck>);

    return ratedeck;
  }

  async remove(id: number): Promise<{ message: string }> {
    const ratedeck = await this.findOne(id);
    await ratedeck.destroy();
    return { message: 'Ratedeck deleted successfully' };
  }
}
