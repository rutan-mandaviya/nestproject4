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

  private safeString(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (value != null) {
      return String(value).trim();
    }
    return '';
  }

  async importFile(file: Express.Multer.File) {
    const fileName = file.originalname.toLowerCase();
    const isCsv = file.mimetype === 'text/csv' || fileName.endsWith('.csv');
    const isXlsx =
      fileName.endsWith('.xlsx') || file.mimetype.includes('spreadsheetml');

    if (!isCsv && !isXlsx) {
      throw new BadRequestException(
        'Please upload a valid .csv or .xlsx file for bulk imports.',
      );
    }

    console.log(
      `--- PREPARING PRICELIST BULK IMPORT: ${file.originalname} ---`,
    );
    let invalidRowsCount = 0;

    const handleChunkInsert = async (rawChunk: any[]) => {
      const cleanData: any[] = [];

      for (const row of rawChunk) {
        const name = this.safeString(row.Name) || this.safeString(row.name);

        if (name) {
          cleanData.push({
            name: name,
            markup:
              this.safeString(row.Markup) || this.safeString(row.markup) || '0',
            routing_type: Number(row['Routing Type'] || row.routing_type) || 0,
            initially_increment:
              Number(row['Initial Increment'] || row.initially_increment) || 1,
            inc: Number(row.Increment || row.inc) || 1,
            status: Number(row.Status || row.status) || 1,
            reseller_id: Number(row['Reseller ID'] || row.reseller_id) || 0,
          });
        } else {
          invalidRowsCount++;
        }
      }

      if (cleanData.length > 0) {
        await this.pricelistModel.bulkCreate(cleanData, {
          validate: false,
          logging: false,
          ignoreDuplicates: true,
        });
        console.log(`🚀 DB Inserted: ${cleanData.length} Pricelist rows...`);
      }
    };

    try {
      const totalRows = await this.excelService.importFileStream(
        file,
        handleChunkInsert,
        20000,
      );

      return {
        success: true,
        totalRowsProcessed: totalRows,
        invalidRowsSkipped: invalidRowsCount,
        message: 'High-Speed bulk import completed successfully!',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('PRICELIST BULK IMPORT ERROR:', errorMessage);
      throw new BadRequestException(
        `Failed to import file data: ${errorMessage}`,
      );
    }
  }

  async exportToExcelStream(res: Response): Promise<void> {
    console.log('--- EXPORTING PRICELISTS VIA GENERIC STREAM ---');

    const columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Markup', key: 'markup', width: 20 },
      { header: 'Routing Type', key: 'routing_type', width: 15 },
      { header: 'Initial Increment', key: 'initially_increment', width: 18 },
      { header: 'Increment', key: 'inc', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Reseller ID', key: 'reseller_id', width: 15 },
    ];

    const fetchPricelistsChunk = async (limit: number, offset: number) => {
      return await this.pricelistModel.findAll({
        raw: true,
        limit: limit,
        offset: offset,
        attributes: [
          'id',
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
      fetchPricelistsChunk,
    );
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
