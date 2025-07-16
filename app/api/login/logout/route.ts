import { NextResponse } from 'next/server';

import { createClient } from '@/app/_lib/supabase/server';

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ status: 200 });
  }
}
