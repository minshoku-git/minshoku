import { NextRequest, NextResponse } from 'next/server';

import { signIn } from '@/app/_lib/supabase/test';

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log(body);
  const result = await signIn(body);
  return NextResponse.json(result);
}
