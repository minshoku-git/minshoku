import { NextRequest, NextResponse } from 'next/server';

import { searchScheduleList } from '@/app/(private)/schedule/_lib/scheduleFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchScheduleList(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
