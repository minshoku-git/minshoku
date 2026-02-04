import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { searchScheduleList } from '@/app/(private)/schedule/_lib/scheduleFunction';
import { ScheduleSearchApiSchema } from '@/app/(private)/schedule/_lib/types';

export async function POST(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, ScheduleSearchApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  // --- 2. データ取得・加工 ---
  const result = await searchScheduleList(validationResult.data);
  if (result.success) {
    return NextResponse.json(result);
  }

  // --- 3. レスポンス返却 ---
  return NextResponse.json(result.error, { status: result.error.status });
}
