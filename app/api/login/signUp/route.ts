import { NextRequest, NextResponse } from 'next/server';

import { signUp } from '@/app/_lib/supabase/test';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await signUp(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
