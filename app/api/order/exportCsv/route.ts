import { NextRequest, NextResponse } from 'next/server';

import { createOrderListCsvData } from '@/app/(private)/order/_lib/orderFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await createOrderListCsvData(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
