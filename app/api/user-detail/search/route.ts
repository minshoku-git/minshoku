import { NextRequest, NextResponse } from 'next/server';

import { searchUserDetail } from '@/app/(private)/user-detail/[id]/_lib/userDetailFuction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchUserDetail(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
