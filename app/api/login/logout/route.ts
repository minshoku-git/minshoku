import { NextResponse } from 'next/server';

import { createClient } from '@/app/_lib/supabase/server';
import { ApiResponse } from '@/app/_types/types';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    const result: ApiResponse<null> = { success: true, data: null };
    return NextResponse.json(result);
  } else {
    console.error(error);
    const result: ApiResponse<null> = {
      success: false,
      error: { code: ErrorCodes.LOGOUT_FAILED.code, message: ErrorCodes.LOGOUT_FAILED.message },
    };
    return NextResponse.json(result);
  }
}
