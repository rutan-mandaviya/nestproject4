import { Module } from '@nestjs/common';
import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Routing } from './model/routing.model';

@Module({
  imports: [SequelizeModule.forFeature([Routing])],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService, SequelizeModule],
})
export class RoutingModule {}
