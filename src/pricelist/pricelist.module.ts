import { Module } from '@nestjs/common';
import { PricelistController } from './pricelist.controller';
import { PricelistService } from './pricelist.service';
import { Pricelist } from './model/pricelist.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Pricelist])],
  controllers: [PricelistController],
  providers: [PricelistService],
})
export class PricelistModule {}
