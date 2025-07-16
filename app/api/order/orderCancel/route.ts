import { NextRequest, NextResponse } from 'next/server';

import { _orderCancel } from '@/app/(private)/order/_lib/orderFunction';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await _orderCancel(body);
  return NextResponse.json(result);
}
