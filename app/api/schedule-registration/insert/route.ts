import { NextResponse } from 'next/server';

import { ApiResponse } from '@/app/_types/types';
import {
  parseScheduleCsv,
  RefreshingScheduleData,
} from '@/app/(private)/schedule-registration/_lib/scheduleRegistrationFunction';
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

    // CSVパース・検証（エラーがあれば行番号付きの詳細を CustomError.details に詰めて throw される）
    const scheduleRows = await parseScheduleCsv(decodedText);

    // スケジュール登録
    const result = await RefreshingScheduleData(scheduleRows.map((r) => r.data));
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
