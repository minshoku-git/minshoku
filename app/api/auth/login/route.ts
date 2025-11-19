import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { LoginFormValues } from '@/app/(public)/login/_lib/types';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

export async function POST(req: NextRequest) {
  // ログインフォームのデータ（メールアドレスとパスワード）を取得
  const {
    request: { email, password },
  } = (await req.json()) as ApiRequest<LoginFormValues>;

  // Supabaseが生成するクッキーを一時的に保存するための配列
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookiesToSet: { name: string; value: string; options?: any }[] = [];

  // Supabaseクライアントを作成
  // cookies.setAllでクッキーをtempCookies配列に格納
  const supabase = createServerClient(process.env.SUPABASE_URL_DEV!, process.env.SUPABASE_ANON_DEV!, {
    db: { schema: process.env.SUPABASE_DB_SCHEMA },
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookies) {
        cookies.forEach((cookie) => {
          cookiesToSet.push(cookie);
        });
      },
    },
  });

  try {
    // Supabaseでサインインを実行
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(signInError);

    if (signInError) {
      const raw = signInError?.code;
      const code: string = typeof raw === 'string' ? raw : ''; // or raw ?? ''

      if (code === 'invalid_credentials') {
        const result: ApiResponse<null> = {
          success: false,
          error: ErrorCodes.INVALID_CREDENTIALS,
        };
        return NextResponse.json(result.error, { status: result.error.status });
      } else {
        const result: ApiResponse<null> = {
          success: false,
          error: ErrorCodes.LOGIN_FAILED,
        };
        return NextResponse.json(result.error, { status: result.error.status });
      }
    }

    // サインイン成功
    const result: ApiResponse<null> = { success: true, data: null };
    const response = NextResponse.json(result);

    // サインイン時にSupabaseが生成したクッキーをレスポンスに手動でセットする
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    return response;
  } catch (e) {
    console.error('予期せぬエラー:', e);
    const result: ApiResponse<null> = {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
    return NextResponse.json(result.error, { status: result.error.status });
  }
}
