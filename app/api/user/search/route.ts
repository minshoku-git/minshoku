import { NextRequest, NextResponse } from 'next/server';

import { searchUserList } from '@/app/(private)/user/_lib/userFuction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchUserList(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
