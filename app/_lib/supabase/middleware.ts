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
        // request.cookies.setは存在しないため削除

        // クッキーはレスポンスにセットする
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
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const publicPaths = ['/', '/login', '/error'];

  console.log('sessionだよー');
  console.log(session);

  // 認証チェック
  if (!user && !publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // クッキーの更新を含むレスポンスを返す
  return supabaseResponse;
}
