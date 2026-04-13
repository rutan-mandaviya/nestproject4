import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { RatedeckService } from './ratedeck.service';
import { CreateRatedeckDto } from './dto/create-ratedeck.dto';
import { UpdateRatedeckDto } from './dto/update-ratedeck.dto';
import { Ratedeck } from './model/ratedeck.model';

@Controller('ratedeck')
export class RatedeckController {
  constructor(private readonly ratedeckService: RatedeckService) {}

  @Get('export')
  async exportData(@Res() res: Response) {
    try {
      const fileName = `Ratedeck_Export_${Date.now()}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      await this.ratedeckService.exportToExcelStream(res);
    } catch (error) {
      if (!res.headersSent) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ success: false, message: errorMessage });
      }
    }
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(@UploadedFile() file: Express.Multer.File) {
    return this.ratedeckService.importFile(file);
  }

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
