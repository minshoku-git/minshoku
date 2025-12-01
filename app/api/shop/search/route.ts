import { NextRequest, NextResponse } from 'next/server';

import { searchShopList } from '@/app/(private)/shop/_lib/shopFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchShopList(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
