import * as csv from 'csv-parse';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import z from 'zod';

import { ApiResponse } from '@/app/_types/types';
import { RefreshingScheduleData } from '@/app/(private)/schedule-registration/_lib/scheduleRegistrationFunction';
import { ScheduleCsvSchema, ScheduleCsvValues } from '@/app/(private)/schedule-registration/_lib/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get('csvFile') as File;

    if (!file) {
      throw new CustomError(ErrorCodes.FILE_NOT_FOUND);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const scheduleDatas: ScheduleCsvValues[] = [];

    // CSVパース処理（Promise化）
    await new Promise<void>((resolve, reject) => {
      const parser = csv.parse({ columns: true, skip_empty_lines: true });

      Readable.from(buffer)
        .pipe(parser)
        .on('data', (row: ScheduleCsvValues) => {
          const parsed = ScheduleCsvSchema.safeParse(row);
          if (!parsed.success) {
            const message = JSON.stringify(z.treeifyError(parsed.error), null, 2);
            console.error(message);
            return reject(new CustomError(ErrorCodes.CSV_VALIDATION_FAILED));
          }
          scheduleDatas.push(parsed.data);
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    // スケジュール登録
    const result = await RefreshingScheduleData(scheduleDatas);
    if (result.success) {
      return NextResponse.json(result);
    }
    return NextResponse.json(result.error, { status: result.error.status });
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      return NextResponse.json(e, { status: e.status });
    }
    const res: ApiResponse<null> = {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
    return NextResponse.json(res);
  }
}
