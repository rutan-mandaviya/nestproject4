import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RatedeckService } from './ratedeck.service';
import { CreateRatedeckDto } from './dto/create-ratedeck.dto';
import { UpdateRatedeckDto } from './dto/update-ratedeck.dto';
import { Ratedeck } from './model/ratedeck.model';

@Controller('ratedeck')
export class RatedeckController {
  constructor(private readonly ratedeckService: RatedeckService) {}

  @Post()
  create(@Body() dto: CreateRatedeckDto): Promise<Ratedeck> {
    return this.ratedeckService.create({ ...dto } as CreateRatedeckDto);
  }

  @Get()
  findAll(): Promise<Ratedeck[]> {
    return this.ratedeckService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Ratedeck> {
    return this.ratedeckService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRatedeckDto,
  ): Promise<Ratedeck> {
    return this.ratedeckService.update(id, { ...dto } as UpdateRatedeckDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.ratedeckService.remove(id);
  }
}
