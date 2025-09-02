import { NextRequest, NextResponse } from 'next/server';

import { searchShopDetail } from '@/app/(private)/shop-detail/[id]/_lib/shopDetailFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchShopDetail(body);
  return NextResponse.json(result);
}
