import { NextRequest, NextResponse } from 'next/server';

import { updateComponyDetail } from '@/app/(private)/company-detail/[id]/_lib/companyDetailFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await updateComponyDetail(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
