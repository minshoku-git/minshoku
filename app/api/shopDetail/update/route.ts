import { NextRequest, NextResponse } from 'next/server';

import { _updateShopDetail } from '@/app/(private)/shop/_lib/shopFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _updateShopDetail(body);
  return NextResponse.json(result);
}
