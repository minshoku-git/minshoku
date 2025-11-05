import { NextRequest, NextResponse } from 'next/server';

import { pullBackUserRegistrationStatus } from '@/app/(private)/user-detail/[id]/_lib/userDetailFuction';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await pullBackUserRegistrationStatus(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
