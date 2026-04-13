import { Module } from '@nestjs/common';

import { CallType } from './model/calltype.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { CallTypeController } from './calltype.controller';
import { CallTypeService } from './calltype.service';

@Module({
  imports: [SequelizeModule.forFeature([CallType])],
  controllers: [CallTypeController],
  providers: [CallTypeService],
})
export class CalltypeModule {}
