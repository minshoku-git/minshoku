import { NextRequest, NextResponse } from 'next/server';

import { _searchOrderDetail } from '@/app/(private)/order/_lib/orderFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchOrderDetail(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
