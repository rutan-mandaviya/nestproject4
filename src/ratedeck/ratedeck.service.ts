import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRatedeckDto } from './dto/create-ratedeck.dto';
import { UpdateRatedeckDto } from './dto/update-ratedeck.dto';
import { Ratedeck } from './model/ratedeck.model';
import { CallType } from 'src/calltype/model/calltype.model';
import { ExcelService } from 'src/shared/excel.service';
import { Response } from 'express';

@Injectable()
export class RatedeckService {
  constructor(
    @InjectModel(Ratedeck)
    private readonly ratedeckModel: typeof Ratedeck,
    private excelService: ExcelService,
  ) {}

  private safeString(val: any): string | null {
    if (val === null || val === undefined) return null;
    return String(val).trim();
  }

  async importFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file was uploaded.');
    }

    const fileName = (file.originalname || '').toLowerCase();
    const mimeType = file.mimetype || '';

    const isCsv = mimeType === 'text/csv' || fileName.endsWith('.csv');
    const isXlsx =
      fileName.endsWith('.xlsx') || mimeType.includes('spreadsheetml');

    if (!isCsv && !isXlsx) {
      throw new BadRequestException(
        'Please upload a valid .csv or .xlsx file.',
      );
    }

    console.log(`--- PREPARING RATEDECK IMPORT: ${file.originalname} ---`);
    let invalidRowsCount = 0;
    const now = new Date();

    const handleChunkInsert = async (rawChunk: Record<string, any>[]) => {
      const cleanData: Partial<Ratedeck>[] = [];

      for (const row of rawChunk) {
        const destination = this.safeString(
          row?.Destination || row?.destination,
        );
        const pattern = this.safeString(row?.Pattern || row?.pattern);

        if (destination && pattern) {
          cleanData.push({
            destination: destination,
            pattern: pattern,
            country_id: Number(row?.['Country ID'] || row?.country_id) || 0,
            call_type: Number(row?.['Call Type'] || row?.call_type) || 1,
            status: Number(row?.Status || row?.status) || 1,
            reseller_id: Number(row?.['Reseller ID'] || row?.reseller_id) || 0,
            creation_date: now,
            last_modified_date: now,
          });
        } else {
          invalidRowsCount++;
        }
      }

      if (cleanData.length > 0) {
        await this.ratedeckModel.bulkCreate(cleanData as any, {
          validate: false,
          logging: false,
          ignoreDuplicates: true,
        });
        console.log(`🚀 DB Inserted: ${cleanData.length} Ratedeck rows...`);
      }
    };

    try {
      const totalRows = await this.excelService.importFileStream(
        file,

        handleChunkInsert as (chunk: any[]) => Promise<void>,
        20000,
      );

      return {
        success: true,
        totalRowsProcessed: totalRows,
        invalidRowsSkipped: invalidRowsCount,
        message: 'High-Speed Ratedeck import completed successfully!',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('RATEDECK IMPORT ERROR:', errorMessage);
      throw new BadRequestException(
        `Failed to import file data: ${errorMessage}`,
      );
    }
  }

  async exportToExcelStream(res: Response): Promise<void> {
    console.log('--- EXPORTING RATEDECK VIA GENERIC STREAM ---');

    const columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Destination', key: 'destination', width: 30 },
      { header: 'Country ID', key: 'country_id', width: 15 },
      { header: 'Pattern', key: 'pattern', width: 20 },
      { header: 'Call Type', key: 'call_type', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Reseller ID', key: 'reseller_id', width: 15 },
      { header: 'Creation Date', key: 'creation_date', width: 20 },
    ];

    const fetchRatedeckChunk = async (limit: number, offset: number) => {
      return await this.ratedeckModel.findAll({
        raw: true,
        limit: limit,
        offset: offset,
        attributes: [
          'id',
          'destination',
          'country_id',
          'pattern',
          'call_type',
          'status',
          'reseller_id',
          'creation_date',
        ],
      });
    };

    await this.excelService.exportToStream(
      res,
      'Ratedeck',
      columns,
      fetchRatedeckChunk,
    );
  }

  async create(dto: CreateRatedeckDto): Promise<Ratedeck> {
    const now = new Date();

    const payload: Partial<Ratedeck> = {
      ...dto,
      creation_date: dto.creation_date ?? now,
      last_modified_date: dto.last_modified_date ?? now,
    };

    return this.ratedeckModel.create(payload);
  }

  async findAll(): Promise<Ratedeck[]> {
    return this.ratedeckModel.findAll({ include: [CallType] });
  }

  async findOne(id: number): Promise<Ratedeck> {
    const ratedeck = await this.ratedeckModel.findByPk(id, {
      include: [CallType],
    });

    if (!ratedeck) {
      throw new NotFoundException('Ratedeck not found');
    }

    return ratedeck;
  }

  async update(id: number, dto: UpdateRatedeckDto): Promise<Ratedeck> {
    const ratedeck = await this.findOne(id);

    await ratedeck.update({
      ...dto,
      last_modified_date: new Date(),
    } as Partial<Ratedeck>);

    return ratedeck;
  }

  async remove(id: number): Promise<{ message: string }> {
    const ratedeck = await this.findOne(id);
    await ratedeck.destroy();
    return { message: 'Ratedeck deleted successfully' };
  }
}
