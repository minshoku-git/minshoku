import { NextRequest, NextResponse } from 'next/server';

import { _searchCompanyDetail } from '@/app/(private)/company-detail/[id]/_lib/companyDetailFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchCompanyDetail(body);
  return NextResponse.json(result);
}
