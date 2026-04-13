import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { Route } from './model/routes.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Routing } from 'src/routing/model/routing.model';
import { ExcelModule } from 'src/shared/excel.module';

@Module({
  imports: [SequelizeModule.forFeature([Route, Routing]), ExcelModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
