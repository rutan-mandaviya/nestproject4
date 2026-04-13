import { Injectable, BadRequestException } from '@nestjs/common';
import ExcelJS from 'exceljs';
import type { Response } from 'express';
import csv from 'csv-parser';
import { Readable } from 'stream';
@Injectable()
export class ExcelService {
  async importFileStream(
    file: Express.Multer.File,
    processChunk: (chunk: any[]) => Promise<void>,
    chunkSize: number = 20000,
  ): Promise<number> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File buffer is missing.');
    }

    console.log(`--- STARTING STREAM: ${file.originalname} ---`);

    let chunk: any[] = [];
    let totalProcessed = 0;

    try {
      for await (const row of this.rowGenerator(file)) {
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
        `--- STREAM COMPLETE: Total Processed = ${totalProcessed} ---`,
      );
      return totalProcessed;
    } catch (error) {
      console.error('File Stream Error:', error);
      throw new Error(`Failed to parse file: ${error.message}`);
    }
  }

  private async *rowGenerator(
    file: Express.Multer.File,
  ): AsyncGenerator<any, void, unknown> {
    const fileName = file.originalname.toLowerCase();
    const stream = Readable.from(file.buffer);

    if (fileName.endsWith('.csv') || file.mimetype === 'text/csv') {
      const csvStream = stream.pipe(csv());
      for await (const row of csvStream) {
        yield row;
      }
    } else if (
      fileName.endsWith('.xlsx') ||
      file.mimetype.includes('spreadsheetml')
    ) {
      const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(
        stream as any,
        {
          worksheets: 'emit',
          sharedStrings: 'cache',
          hyperlinks: 'ignore',
        },
      );

      let headers: string[] = [];

      for await (const worksheetReader of workbookReader) {
        for await (const row of worksheetReader) {
          const rowValues = row.values as any[];

          if (headers.length === 0) {
            rowValues.forEach((val, index) => {
              if (index > 0)
                headers[index] = val?.toString().trim() || `Column_${index}`;
            });
            continue;
          }

          const rowObject: any = {};
          let hasData = false;

          rowValues.forEach((val, index) => {
            if (index > 0 && headers[index]) {
              const cellValue =
                val && typeof val === 'object' && val.richText
                  ? val.richText.map((rt: any) => rt.text).join('')
                  : val;

              rowObject[headers[index]] = cellValue;
              if (
                cellValue !== null &&
                cellValue !== undefined &&
                cellValue !== ''
              ) {
                hasData = true;
              }
            }
          });

          if (hasData) {
            yield rowObject;
          }
        }
        break;
      }
    } else {
      throw new BadRequestException(
        'Unsupported file format. Please upload .csv or .xlsx',
      );
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
