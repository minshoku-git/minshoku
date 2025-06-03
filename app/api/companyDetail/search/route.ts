import { NextRequest, NextResponse } from 'next/server';

import { _searchComponyDetail } from '@/app/(private)/companyDetail/[id]/_lib/companyDetailFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchComponyDetail(body);
  return NextResponse.json(result);
}
