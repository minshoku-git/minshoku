import { NextRequest, NextResponse } from 'next/server';

import { _searchShopList } from '@/app/(private)/shop/_lib/shopFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchShopList(body);
  return NextResponse.json(result);
}
