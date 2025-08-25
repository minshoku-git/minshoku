import { NextRequest, NextResponse } from 'next/server';

import { approvalUserRegistrationStatus } from '@/app/(private)/userDetail/[id]/_lib/userDetailFuction';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await approvalUserRegistrationStatus(body);
  return NextResponse.json(result);
}
