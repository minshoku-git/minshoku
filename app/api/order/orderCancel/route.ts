import { NextRequest, NextResponse } from 'next/server';

import { _orderCancel } from '@/app/(private)/order/_lib/orderFunction';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await _orderCancel(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
