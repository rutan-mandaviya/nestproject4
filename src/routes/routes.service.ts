import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CallType } from 'src/calltype/model/calltype.model';
import { Pricelist } from 'src/pricelist/model/pricelist.model';
import { Routing } from 'src/routing/model/routing.model';
import { CreateRouteDto, UpdateRouteDto } from './dto/routes.dto';
import { Route } from './model/routes.model';
import { ExcelService } from 'src/shared/excel.service';
import { Response } from 'express';

interface ExcelRow {
  Code?: string | number;
  Destination?: string;
  'Connect Cost'?: string | number;
  'Included Seconds'?: string | number;
  'Per Minute Cost'?: string | number;
  Increment?: string | number;
  Precedence?: string | number;
  'Call Type'?: string;
}
@Injectable()
export class RoutesService {
  constructor(
    @InjectModel(Route) private readonly routesModel: typeof Route,
    @InjectModel(Routing) private readonly routingModel: typeof Routing,
    private readonly excelService: ExcelService,
  ) {}

  async importFromCsv(file: Express.Multer.File) {
    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException(
        'Please upload a valid .csv file for bulk imports.',
      );
    }

    console.log('--- PREPARING CSV IMPORT ---');
    let invalidRowsCount = 0;

    const handleChunkInsert = async (rawChunk: ExcelRow[]) => {
      const cleanData: any[] = [];

      for (const row of rawChunk) {
        const code = row.Code?.toString().trim();
        const perMinuteCost = Number(row['Per Minute Cost']);

        if (code && !isNaN(perMinuteCost) && perMinuteCost >= 0) {
          cleanData.push({
            code: code,
            destination: row.Destination?.toString().trim() || 'Unknown',
            connectCost: Number(row['Connect Cost']) || 0,
            includedSeconds: Number(row['Included Seconds']) || 0,
            perMinuteCost: perMinuteCost,
            billingIncrement: Number(row.Increment) || 1,
            precedence: Number(row.Precedence) || 0,
            callTypeId: this.mapCallType(row['Call Type']),
            pricelistId: null,
            status: 1,
          });
        } else {
          invalidRowsCount++;
        }
      }

      if (cleanData.length > 0) {
        await this.routesModel.bulkCreate(cleanData, {
          validate: false,
          logging: false,
        });
        console.log(`🚀 DB Inserted: ${cleanData.length} rows...`);
      }
    };

    try {
      const totalRows = await this.excelService.importFileStream(
        file,
        handleChunkInsert,
        20000,
      );
      console.log('total rows', totalRows);

      return {
        success: true,
        totalRowsProcessed: totalRows,
        invalidRowsSkipped: invalidRowsCount,
        message: 'High-Speed CSV Import completed successfully!',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('CSV IMPORT ERROR:', errorMessage);
      throw new Error(`Failed to import CSV data: ${errorMessage}`);
    }
  }

  private mapCallType(type?: string): number {
    if (!type) return 1; // Default
    const t = type.toLowerCase();
    if (t.includes('mobile')) return 2;
    if (t.includes('landline')) return 3;
    return 1;
  }

  async exportToExcelStream(res: Response): Promise<void> {
    console.log('--- EXPORTING ROUTES VIA GENERIC STREAM ---');

    const columns = [
      { header: 'Code', key: 'code', width: 20 },
      { header: 'Destination', key: 'destination', width: 30 },
      { header: 'Connect Cost', key: 'connectCost', width: 15 },
      { header: 'Included Seconds', key: 'includedSeconds', width: 15 },
      { header: 'Per Minute Cost', key: 'perMinuteCost', width: 20 },
      { header: 'Increment', key: 'increment', width: 10 },
      { header: 'Precedence', key: 'precedence', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    const fetchRoutesChunk = async (limit: number, offset: number) => {
      return await this.routesModel.findAll({
        raw: true,
        limit: limit,
        offset: offset,
        attributes: [
          'code',
          'destination',
          'connectCost',
          'includedSeconds',
          'perMinuteCost',
          'increment',
          'precedence',
          'status',
        ],
      });
    };

    await this.excelService.exportToStream(
      res,
      'Routes Data',
      columns,
      fetchRoutesChunk,
    );
  }
  async create(data: CreateRouteDto): Promise<Route> {
    const route = await this.routesModel.create({ ...data } as Partial<Route>);

    const routingData = {
      routes_id: route.id,
      pricelist_id: null,
      percentage: '0',
      call_count: 0,
      quality_base: null,
    } as unknown as Routing;
    await this.routingModel.create(routingData);

    return route;
  }

  async findAll(): Promise<Route[]> {
    return this.routesModel.findAll({
      include: [Routing, CallType, Pricelist],
    });
  }

  async findOne(id: number): Promise<Route> {
    const route = await this.routesModel.findByPk(id, {
      include: [Routing, CallType, Pricelist],
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async update(id: number, data: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);
    await route.update({ ...data } as Partial<Route>);
    return route;
  }

  async remove(id: number): Promise<{ message: string }> {
    const route = await this.findOne(id);
    await this.routingModel.destroy({ where: { routes_id: id } });
    await route.destroy();
    return { message: 'Route deleted successfully' };
  }
}
