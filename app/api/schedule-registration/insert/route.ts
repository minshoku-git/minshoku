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
    let decodedText = '';

    try {
      // 1. まずは UTF-8 (fatalオプションを有効化) でのデコードを試みる
      // fatal: true により、Shift-JISのファイルが来た際に例外(TypeError)を発生させます
      const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
      decodedText = utf8Decoder.decode(arrayBuffer);
    } catch (e) {
      // 2. UTF-8 でエラーが発生した場合は、Shift-JIS (MS932) と判定してデコードする
      // ※ 'windows-31j' は 'shift-jis' の拡張（Microsoftコードページ932）で、
      // 丸数字(①)や「株」の合字(株)などの機種依存文字も文字化けせずにパースできます。
      const sjisDecoder = new TextDecoder('windows-31j');
      decodedText = sjisDecoder.decode(arrayBuffer);
    }

    const scheduleDatas: ScheduleCsvValues[] = [];

    // CSVパース処理（decodedText を stream に変換して渡す）
    await new Promise<void>((resolve, reject) => {
      const parser = csv.parse({ columns: true, skip_empty_lines: true });

      Readable.from(decodedText)
        .pipe(parser)
        .on('data', (row: ScheduleCsvValues) => {
          const parsed = ScheduleCsvSchema.safeParse(row);
          if (!parsed.success) {
            // z.treeifyError が無いプロジェクトに対応するため .format() を使用
            console.error(JSON.stringify(parsed.error.format(), null, 2));
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
