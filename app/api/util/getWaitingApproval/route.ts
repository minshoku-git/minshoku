import { NextRequest, NextResponse } from 'next/server';

import { getWaitingApproval } from '@/app/_lib/getWaitingApproval/getWaitingApproval';

export async function POST(_req: NextRequest) {
  // 引数なし
  const result = await getWaitingApproval();
  return NextResponse.json(result);
}
