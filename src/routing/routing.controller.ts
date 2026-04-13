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
import { RoutingService } from './routing.service';
import { CreateRoutingDto } from './dto/create-routing.dto';
import { UpdateRoutingDto } from './dto/update-routing.dto';
import { Routing } from './model/routing.model';

@Controller('routing')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Post()
  create(@Body() dto: CreateRoutingDto): Promise<Routing> {
    return this.routingService.create(dto);
  }

  @Get()
  findAll(): Promise<Routing[]> {
    return this.routingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Routing> {
    return this.routingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoutingDto,
  ): Promise<Routing> {
    return this.routingService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.routingService.remove(id);
  }
}
