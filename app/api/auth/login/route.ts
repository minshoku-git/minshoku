import { createServerClient } from '@supabase/ssr';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { t_administrator } from '@/app/_lib/supabase/tableTypes';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { LoginFormValues } from '@/app/(public)/login/_lib/types';
import { CustomError } from '@/app/errors/customError';
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
    // 1.ユーザー情報取得
    const query = supabase.from('t_administrator').select('*').eq('email', email).single();
    const { error } = (await query) as PostgrestSingleResponse<t_administrator>;

    if (error) {
      // MEMO: メールアドレスの特定を避けるためにサインインエラーと同じエラーを出力
      throw new CustomError(ErrorCodes.LOGIN_FAILED);
    }

    // 2.Supabaseでサインインを実行
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(signInError);

    if (signInError) {
      const raw = signInError?.code;
      const code: string = typeof raw === 'string' ? raw : '';

      if (code === 'invalid_credentials') {
        throw new CustomError(ErrorCodes.INVALID_CREDENTIALS);
      } else {
        throw new CustomError(ErrorCodes.LOGIN_FAILED);
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
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      return NextResponse.json(e, { status: e.status });
    }
    return NextResponse.json(ErrorCodes.INTERNAL_SERVER_ERROR, { status: ErrorCodes.INTERNAL_SERVER_ERROR.status });
  }
}
