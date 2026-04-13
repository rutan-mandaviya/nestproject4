import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Routing } from 'src/routing/model/routing.model';
import { CreatePricelistDto } from './dto/create-pricelist.dto';
import { UpdatePricelistDto } from './dto/update-pricelist.dto';
import { Pricelist } from './model/pricelist.model';
import { ExcelService } from 'src/shared/excel.service';
import { Response } from 'express';

@Injectable()
export class PricelistService {
  constructor(
    @InjectModel(Pricelist)
    private readonly pricelistModel: typeof Pricelist,
    private readonly excelService: ExcelService,
  ) {}

  async exportToExcelStream(res: Response): Promise<void> {
    const columns = [
      { header: 'Name ', key: 'name', width: 25 },
      { header: 'Markup', key: 'markup', width: 15 },
      { header: 'Routing Type', key: 'routing_type', width: 15 },
      { header: 'Initially Increment', key: 'initially_increment', width: 20 },
      { header: 'Inc', key: 'inc', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Reseller ID', key: 'reseller_id', width: 15 },
    ];

    const fetchPricelistChunk = async (limit: number, offset: number) => {
      return await this.pricelistModel.findAll({
        raw: true,
        limit: limit,
        offset: offset,
        attributes: [
          'name',
          'markup',
          'routing_type',
          'initially_increment',
          'inc',
          'status',
          'reseller_id',
        ],
      });
    };

    await this.excelService.exportToStream(
      res,
      'Pricelists',
      columns,
      fetchPricelistChunk,
    );
  }

  async importFromCsv(file: Express.Multer.File) {
    this.validateCsvFile(file);

    let invalidRowsCount = 0;

    const handleChunkInsert = async (rawChunk: any[]) => {
      const cleanData: any[] = [];

      for (const row of rawChunk) {
        if (this.isValidRow(row)) {
          cleanData.push(this.formatRowForDb(row));
        } else {
          invalidRowsCount++;
        }
      }

      await this.insertBulkData(cleanData);
    };

    try {
      const CHUNK_SIZE = 20000;
      const totalRows = await this.excelService.importFromCsvStream(
        file,
        handleChunkInsert,
        CHUNK_SIZE,
      );

      return {
        success: true,
        totalRowsProcessed: totalRows,
        invalidRowsSkipped: invalidRowsCount,
        message: 'Pricelist CSV Import completed successfully!',
      };
    } catch (error) {
      throw new Error(`Failed to import Pricelist data: ${error.message}`);
    }
  }

  private validateCsvFile(file: Express.Multer.File) {
    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Please upload a valid .csv file.');
    }
  }

  private isValidRow(row: any): boolean {
    const name = row['Name']?.toString().trim();
    return Boolean(name);
  }

  private formatRowForDb(row: any): any {
    return {
      name: row['Name']?.toString().trim().substring(0, 30),
      markup: row['Markup']?.toString().trim().substring(0, 50) || '0',
      routing_type: Number(row['Routing Type']) || 1,
      initially_increment: Number(row['Initially Increment']) || 1,
      inc: Number(row['Inc']) || 1,
      status:
        row['Status'] !== undefined && row['Status'] !== ''
          ? Number(row['Status'])
          : 1,
      reseller_id: Number(row['Reseller ID']) || null,
    };
  }

  private async insertBulkData(cleanData: any[]) {
    if (cleanData.length === 0) return;

    await this.pricelistModel.bulkCreate(cleanData, {
      validate: false,
      logging: false,
    });
  }

  async create(dto: CreatePricelistDto) {
    return this.pricelistModel.create({ ...dto } as Partial<Pricelist>);
  }

  async findAll() {
    return this.pricelistModel.findAll({ include: [Routing] });
  }

  async findOne(id: number) {
    const pricelist = await this.pricelistModel.findByPk(id, {
      include: [Routing],
    });

    if (!pricelist) {
      throw new NotFoundException('Pricelist not found');
    }

    return pricelist;
  }

  async update(id: number, dto: UpdatePricelistDto) {
    const pricelist = await this.findOne(id);
    await pricelist.update({ ...dto } as Partial<Pricelist>);
    return pricelist;
  }

  async remove(id: number) {
    const pricelist = await this.findOne(id);
    await pricelist.destroy();
    return { message: 'Pricelist deleted successfully' };
  }
}
