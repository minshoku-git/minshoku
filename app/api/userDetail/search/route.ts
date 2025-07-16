import { NextRequest, NextResponse } from 'next/server';

import { _searchUserList } from '@/app/(private)/user/_lib/userFuction';
import { _searchUserDetail } from '@/app/(private)/userDetail/[id]/_lib/userDetailFuction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchUserDetail(body);
  return NextResponse.json(result);
}
