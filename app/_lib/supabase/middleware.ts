import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { UsageStatus } from '@/app/_types/enum';

export async function updateSession(request: NextRequest) {
  // 最初のレスポンスオブジェクトを作成
  const supabaseResponse = NextResponse.next({
    request,
  });

  // Supabaseクライアントを作成
  const supabase = createServerClient(process.env.SUPABASE_URL_DEV!, process.env.SUPABASE_ANON_DEV!, {
    db: { schema: process.env.SUPABASE_DB_SCHEMA },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (options) {
            supabaseResponse.cookies.set(name, value, options);
          } else {
            supabaseResponse.cookies.set(name, value);
          }
        });
      },
    },
  });

  // ユーザー情報とセッション情報を取得
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;
  const publicPaths = ['/', '/login', '/error'];
  const isProtectedPath = !publicPaths.some((path) => currentPath === path);

  // 認証チェック
  // セッションが存在しない、かつ保護されたパスにアクセスしている場合のみ/loginにリダイレクト
  if (!session && isProtectedPath) {
    return redirectToLogin(request);
  }

  // セッションありの場合に t_user を確認
  if (session && user) {
    const userEmail = user.email;
    const { data: userData, error } = await supabase
      .from('t_administrator')
      .select(`name, usage_state`)
      .eq('email', userEmail)
      .maybeSingle();

    if (error || !userData) {
      console.log('userEmail', userEmail);
      console.error('Failed to fetch user from t_user:', error);
      // MEMO: セッション有り&ユーザー情報がないパターンが存在するので、強制ログアウトする。
      // マスタ管理でログインした後にユーザー画面を開いた場合、セッションは維持されるし、管理者はユーザー情報を持たない。
      await supabase.auth.signOut();
      return redirectToLogin(request);
    }

    // 利用ステータスが利用不可の場合は強制ログアウトする。
    if (userData.usage_state === UsageStatus.DEACTIVATION) {
      await supabase.auth.signOut();
      return redirectToLogin(request);
    }

    // 認証済みユーザーが公開パスにアクセスした場合、/orderにリダイレクト
    if (session && (currentPath === '/' || currentPath === '/login')) {
      const url = request.nextUrl.clone();
      url.pathname = '/schedule';
      return NextResponse.redirect(url);
    }
  }

  // クッキーの更新を含むレスポンスを返す
  return supabaseResponse;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}
