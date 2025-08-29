import { NextRequest, NextResponse } from 'next/server';

import { approvalUserRegistrationStatus } from '@/app/(public)/decision-result/[token]/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await approvalUserRegistrationStatus(body);
  return NextResponse.json(result);
}
