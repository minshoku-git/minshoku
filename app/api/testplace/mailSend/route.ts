import { NextRequest, NextResponse } from 'next/server';

import { send } from '@/app/_lib/mailer/mailer';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await send(body);
  return NextResponse.json(result);
}
