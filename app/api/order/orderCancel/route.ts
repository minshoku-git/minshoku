import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { orderCancel } from '@/app/(private)/order/_lib/orderFunction';
import { OrderCancelApiSchema } from '@/app/(private)/order/_lib/types';

export async function PUT(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, OrderCancelApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }
  // --- 2. データ取得・加工 ---
  const result = await orderCancel(validationResult.data);

  // --- 3. レスポンス返却 ---
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
