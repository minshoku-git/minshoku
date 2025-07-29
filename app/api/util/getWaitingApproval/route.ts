import { NextRequest, NextResponse } from 'next/server';

import { getWaitingApproval } from '@/app/_lib/getWaitingApproval/getWaitingApproval';
import { _searchUserList } from '@/app/(private)/user/_lib/userFuction';
import { _searchUserDetail } from '@/app/(private)/userDetail/[id]/_lib/userDetailFuction';

export async function POST(_req: NextRequest) {
  // 引数なし
  const result = await getWaitingApproval();
  return NextResponse.json(result);
}
