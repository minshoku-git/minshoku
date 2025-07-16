import { NextRequest, NextResponse } from 'next/server';

import { signUp } from '@/app/_lib/supabase/test';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await signUp(body);
  return NextResponse.json(result);
}
