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
import type { Response } from 'express';
import { RoutesService } from './routes.service';
import { CreateRouteDto, UpdateRouteDto } from './dto/routes.dto';
import { Route } from './model/routes.model';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get('export')
  async exportData(@Res() res: Response) {
    try {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      const fileName = `routes_export_${new Date().getTime()}.xlsx`;
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      await this.routesService.exportToExcelStream(res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    return this.routesService.importFromCsv(file);
  }

  @Post()
  create(@Body() body: CreateRouteDto): Promise<Route> {
    return this.routesService.create(body);
  }

  @Get()
  findAll(): Promise<Route[]> {
    return this.routesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Route> {
    return this.routesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRouteDto,
  ): Promise<Route> {
    return this.routesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.routesService.remove(id);
  }
}
