import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/app/_lib/supabase/server';
import { ApiResponse } from '@/app/_types/types';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

export async function POST(_req: Request) {
  try {
    const supabase = await createClient(); // 新しいクライアントインスタンスを生成

    // サインアウトを呼び出す
    const { error } = await supabase.auth.signOut();

    if (error) {
      // セッションがない場合のエラーは、ログアウト成功とみなす
      if (error.name === 'AuthSessionMissingError') {
        return NextResponse.json({ message: 'Logged out successfully (session was already missing)' }, { status: 200 });
      }
      const req: ApiResponse<null> = {
        success: false,
        error: ErrorCodes.LOGOUT_FAILED,
      };
      return NextResponse.json(req);
    }
    const req: ApiResponse<null> = { success: true, data: null };

    return NextResponse.json(req);
  } catch (error) {
    const req: ApiResponse<null> = {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
    return NextResponse.json(req);
  }
}
