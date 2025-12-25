import { NextRequest, NextResponse } from 'next/server';

import { getWaitingApproval } from '@/app/_lib/getWaitingApproval/getWaitingApproval';

export async function POST(_req: NextRequest) {
  // --- 1. リクエスト検証 ---
  // MEMO：リクエストなし

  // --- 2. データ取得・加工 ---
  const result = await getWaitingApproval();

  // --- 3. レスポンス返却 ---
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
