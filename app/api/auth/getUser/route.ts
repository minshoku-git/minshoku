import { NextResponse } from 'next/server';

import { getUser } from '@/app/_lib/supabase/test';

export async function POST() {
  const result = await getUser();
  return NextResponse.json(result);
}
