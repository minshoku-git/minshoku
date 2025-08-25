import { NextRequest, NextResponse } from 'next/server';

import { searchUserDetail } from '@/app/(private)/userDetail/[id]/_lib/userDetailFuction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchUserDetail(body);
  return NextResponse.json(result);
}
