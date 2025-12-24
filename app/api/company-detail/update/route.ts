import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { updateComponyDetail } from '@/app/(private)/company-detail/[id]/_lib/companyDetailFunction';
import { CompanyDetailApiSchema } from '@/app/(private)/company-detail/[id]/_lib/types';

/**
 * 会社一覧の検索API
 * @param req リクエスト
 * @returns 結果またはエラーレスポンス
 */
export async function POST(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, CompanyDetailApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  // --- 2. データ取得・加工 ---
  const result = await updateComponyDetail(validationResult.data);

  // --- 3. レスポンス返却 ---
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
