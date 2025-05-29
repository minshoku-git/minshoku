import { NextRequest, NextResponse } from 'next/server';

import { _searchUserList } from '@/app/(private)/user/_lib/userFuction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchUserList(body);
  return NextResponse.json(result);
}
