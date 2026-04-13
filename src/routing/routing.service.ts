import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Pricelist } from 'src/pricelist/model/pricelist.model';
import { Route } from 'src/routes/model/routes.model';
import { CreateRoutingDto } from './dto/create-routing.dto';
import { UpdateRoutingDto } from './dto/update-routing.dto';
import { Routing } from './model/routing.model';

@Injectable()
export class RoutingService {
  constructor(
    @InjectModel(Routing)
    private readonly routingModel: typeof Routing,
  ) {}

  async create(dto: CreateRoutingDto): Promise<Routing> {
    const payload = { ...dto } as unknown as Routing;
    return this.routingModel.create(payload);
  }

  async findAll(): Promise<Routing[]> {
    return this.routingModel.findAll({ include: [Route, Pricelist] });
  }

  async findOne(id: number): Promise<Routing> {
    const routing = await this.routingModel.findByPk(id, {
      include: [Route, Pricelist],
    });

    if (!routing) {
      throw new NotFoundException('Routing not found');
    }

    return routing;
  }

  async update(id: number, dto: UpdateRoutingDto): Promise<Routing> {
    const routing = await this.findOne(id);
    await routing.update({ ...dto } as Partial<Routing>);
    return routing;
  }

  async remove(id: number): Promise<{ message: string }> {
    const routing = await this.findOne(id);
    await routing.destroy();
    return { message: 'Routing deleted successfully' };
  }
}
