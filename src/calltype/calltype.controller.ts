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
import { CallTypeService } from './calltype.service';
import { CreateCallTypeDto } from './dto/create-calltype.dto';
import { UpdateCallTypeDto } from './dto/update-calltype.dto';

@Controller('calltype')
export class CallTypeController {
  constructor(private readonly callTypeService: CallTypeService) {}

  @Post()
  create(@Body() dto: CreateCallTypeDto) {
    return this.callTypeService.create(dto);
  }

  @Get()
  findAll() {
    return this.callTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.callTypeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCallTypeDto,
  ) {
    return this.callTypeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.callTypeService.remove(id);
  }
}
