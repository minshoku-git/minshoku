import { NextRequest, NextResponse } from 'next/server';

import { searchComponyList } from '@/app/(private)/company/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchComponyList(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
