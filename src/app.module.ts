import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RatedeckModule } from './ratedeck/ratedeck.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { PricelistModule } from './pricelist/pricelist.module';
import { RoutesModule } from './routes/routes.module';
import { CalltypeModule } from './calltype/calltype.module';
import { RoutingModule } from './routing/routing.module';
import { Ratedeck } from './ratedeck/model/ratedeck.model';
import { Pricelist } from './pricelist/model/pricelist.model';
import { CallType } from './calltype/model/calltype.model';
import { Route } from './routes/model/routes.model';
import { Routing } from './routing/model/routing.model';
import { ExcelModule } from './shared/excel.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Root@123',
      database: 'nest_project_4',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      models: [Ratedeck, Pricelist, CallType, Route, Routing],
    }),
    RoutesModule,
    RoutingModule,
    CalltypeModule,
    RatedeckModule,
    PricelistModule,
    ExcelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
