import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { searchShopDetail } from '@/app/(private)/shop-detail/[id]/_lib/shopDetailFunction';
import { ShopDetailInitApiSchema } from '@/app/(private)/shop-detail/[id]/_lib/types';

export async function POST(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, ShopDetailInitApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  // --- 2. データ取得・加工 ---
  const result = await searchShopDetail(validationResult.data);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
