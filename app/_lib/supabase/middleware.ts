import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  // 最初のレスポンスオブジェクトを作成
  const supabaseResponse = NextResponse.next({
    request,
  });

  // Supabaseクライアントを作成
  const supabase = createServerClient(process.env.SUPABASE_URL_DEV!, process.env.SUPABASE_ANON_DEV!, {
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

  const currentPath = request.nextUrl.pathname;
  const publicPaths = ['/', '/login', '/error'];
  const isProtectedPath = !publicPaths.some((path) => currentPath === path);

  // 認証済みユーザーが公開パスにアクセスした場合、/orderにリダイレクト
  if (session && (currentPath === '/' || currentPath === '/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/schedule';
    return NextResponse.redirect(url);
  }

  // 認証チェック
  // セッションが存在しない、かつ保護されたパスにアクセスしている場合のみ/loginにリダイレクト
  if (!session && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // クッキーの更新を含むレスポンスを返す
  return supabaseResponse;
}
