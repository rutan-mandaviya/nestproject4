import { Injectable, BadRequestException } from '@nestjs/common';
import ExcelJS from 'exceljs';
import type { Response } from 'express';
import csv from 'csv-parser'; // 🔥 Naya Import
import { Readable } from 'stream'; // Node.js ka in-built module
@Injectable()
export class ExcelService {
  async importFromCsvStream(
    file: Express.Multer.File,
    processChunk: (chunk: any[]) => Promise<void>,
    chunkSize: number = 20000,
  ): Promise<number> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File buffer is missing.');
    }

    console.log('--- STARTING CLEAN CSV STREAMING ---');

    const stream = Readable.from(file.buffer);

    const csvStream = stream.pipe(csv());

    let chunk: any[] = [];
    let totalProcessed = 0;

    try {
      for await (const row of csvStream) {
        chunk.push(row);

        if (chunk.length >= chunkSize) {
          await processChunk(chunk);
          totalProcessed += chunk.length;
          chunk = [];
        }
      }

      if (chunk.length > 0) {
        await processChunk(chunk);
        totalProcessed += chunk.length;
      }

      console.log(
        `--- CSV STREAM COMPLETE: Total Processed = ${totalProcessed} ---`,
      );
      return totalProcessed;
    } catch (error) {
      console.error('CSV Stream Error:', error);
      throw new Error('Failed to parse CSV data properly.');
    }
  }
  async exportToStream<T>(
    res: Response,
    sheetName: string,
    columns: Partial<ExcelJS.Column>[],
    fetchDataChunk: (limit: number, offset: number) => Promise<T[]>,
    chunkSize: number = 15000,
  ): Promise<void> {
    const options = {
      stream: res,
      useStyles: true,
      useSharedStrings: true,
    };
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter(options as any);
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = columns;

    worksheet.getRow(1).font = { name: 'Calibri', size: 10 };

    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const chunk = await fetchDataChunk(chunkSize, offset);

      if (!chunk || chunk.length === 0) {
        hasMoreData = false;
        break;
      }

      for (const row of chunk) {
        worksheet.addRow(row).commit();
      }

      offset += chunkSize;
    }

    worksheet.commit();
    await workbook.commit();
  }
}
