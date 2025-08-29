import { NextRequest, NextResponse } from 'next/server';

import { _searchShopDetail } from '@/app/(private)/shop-detail/[id]/_lib/shopDetailFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchShopDetail(body);
  return NextResponse.json(result);
}
