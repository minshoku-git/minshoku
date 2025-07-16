import * as csv from 'csv-parse';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

import { ApiResponse } from '@/app/_types/types';
import { _RefreshingScheduleData } from '@/app/(private)/scheduleRegistration/_lib/scheduleRegistrationFunction';
import { scheduleCsvValues } from '@/app/(private)/scheduleRegistration/_lib/types';

// POSTエンドポイント
export async function POST(req: Request): Promise<Response> {
  // CSV ファイルを FormData から取得
  const formData = await req.formData();
  const file = formData.get('csvFile') as File;

  if (!file) {
    return NextResponse.json({ error: 'CSVファイルが見つかりません' }, { status: 400 });
  }

  // ファイルの読み込み（バイナリデータとして）
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // CSV パース処理
  // columns: true 1行目をキーとして、以降の行をオブジェクトとして扱う
  // skip_empty_lines: true は空行を無視
  const parser = csv.parse({ columns: true, skip_empty_lines: true });
  const scheduleDatas: scheduleCsvValues[] = [];
  let result: ApiResponse<string> = { data: null, error: null };

  // ストリームをパース
  Readable.from(buffer)
    .pipe(parser)
    .on('data', (row: scheduleCsvValues) => {
      // CSV の行を 型にマッピング
      const scheduleData: scheduleCsvValues = row;
      // マッピングされたオブジェクトを配列に追加
      scheduleDatas.push(scheduleData);
    })
    .on('end', async () => {
      // 洗い替え処理の呼び出し
      result = await _RefreshingScheduleData(scheduleDatas);
    })
    .on('error', (err) => {
      console.error(err);
      result = { data: null, error: 'CSVファイルの読み取りに失敗しました。' };
    });

  // 結果返却
  return NextResponse.json(result);
}
