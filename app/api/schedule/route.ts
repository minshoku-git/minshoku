import { NextRequest, NextResponse } from 'next/server';

import { _searchScheduleList } from '@/app/(private)/schedule/_lib/scheduleFunction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await _searchScheduleList(body);
  return NextResponse.json(result);
}
