import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { UserDetailApiSchema, UserDetailDisapprovalApiSchema } from '@/app/(private)/user-detail/[id]/_lib/types';
import { disapprovalUserRegistrationStatus } from '@/app/(private)/user-detail/[id]/_lib/userDetailFuction';

export async function PUT(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, UserDetailDisapprovalApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }
  // --- 2. データ取得・加工 ---
  const result = await disapprovalUserRegistrationStatus(validationResult.data);

  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
