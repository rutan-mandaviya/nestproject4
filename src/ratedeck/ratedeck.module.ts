import { Module } from '@nestjs/common';
import { RatedeckController } from './ratedeck.controller';
import { RatedeckService } from './ratedeck.service';
import { Ratedeck } from './model/ratedeck.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Ratedeck])],
  controllers: [RatedeckController],
  providers: [RatedeckService],
})
export class RatedeckModule {}
