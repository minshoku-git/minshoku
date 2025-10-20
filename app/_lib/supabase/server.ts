import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Client } from 'pg';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.SUPABASE_URL_DEV!, process.env.SUPABASE_ANON_DEV!, {
    db: { schema: process.env.SUPABASE_DB_SCHEMA },
    cookies: {
      getAll() {
        // 現在のリクエストのクッキーをすべて取得（ログイン状態を確認するのに必要）。
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Supabase がセッションを更新した際にクッキーを書き直すために呼ばれる。
        // ただし、Server Component から cookies().set() を呼ぶと例外が出るので、それを try/catch で無視。
        // 通常はこの部分は middleware.ts などがセッション更新を担うため、問題なし。
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
/**
 * "pg"クライアント初期化
 * @returns {Client} "pg"Client
 */
export const createPgClient = (): InstanceType<typeof Client> => {
  return new Client({ connectionString: process.env.SUPABASE_DB_CONNECTION_STRING_DEV });
};
