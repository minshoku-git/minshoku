import { NextRequest, NextResponse } from 'next/server';

import { _searchComponyList } from '@/app/(private)/company/_lib/companyFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchComponyList(body);
  return NextResponse.json(result);
}
