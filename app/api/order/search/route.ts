import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { searchOrderList } from '@/app/(private)/order/_lib/orderFunction';
import { OrderSearchApiSchema } from '@/app/(private)/order/_lib/types';

/**
 * オーダー一覧の検索API
 * @param req リクエスト
 * @returns 結果またはエラーレスポンス
 */
export async function POST(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, OrderSearchApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  // --- 2. データ取得・加工 ---
  const result = await searchOrderList(validationResult.data);

  // --- 3. レスポンス返却 ---
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
