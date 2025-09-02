import { NextRequest, NextResponse } from 'next/server';

import { searchComponyList } from '@/app/(private)/company/_lib/companyFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchComponyList(body);
  return NextResponse.json(result);
}
