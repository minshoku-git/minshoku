import { NextRequest, NextResponse } from 'next/server';

import { _searchOrderList } from '@/app/(private)/order/_lib/orderFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchOrderList(body);
  return NextResponse.json(result);
}
