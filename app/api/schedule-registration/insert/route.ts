import * as csv from 'csv-parse';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

import { ApiResponse } from '@/app/_types/types';
import { RefreshingScheduleData } from '@/app/(private)/schedule-registration/_lib/scheduleRegistrationFunction';
import { ScheduleCsvSchema, ScheduleCsvValues } from '@/app/(private)/schedule-registration/_lib/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

// POSTエンドポイント
export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get('csvFile') as File;

    if (!file) {
      const res: ApiResponse<null> = { success: false, error: { code: '', message: '' } };
      return NextResponse.json(res);
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
            const message = JSON.stringify(parsed.error.format(), null, 2);
            console.log(message);
            return reject(new CustomError(ErrorCodes.CSV_VALIDATION_FAILED));
          }
          scheduleDatas.push(parsed.data);
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    // 洗い替え処理
    const result = await RefreshingScheduleData(scheduleDatas);
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      const res: ApiResponse<null> = { success: false, error: { code: e.code, message: e.message } };
      return NextResponse.json(res);
    }
    const res: ApiResponse<null> = {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
    return NextResponse.json(res);
  }
}
