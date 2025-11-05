import { NextRequest, NextResponse } from 'next/server';

import { searchShopDetail } from '@/app/(private)/shop-detail/[id]/_lib/shopDetailFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchShopDetail(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
