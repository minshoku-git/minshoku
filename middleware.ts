import { type NextRequest } from 'next/server';

import { updateSession } from './app/_lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
export const config = {
  // 認証時、閲覧可能なページ
  matcher: [
    '/company',
    '/company-detail/:id*',
    '/order',
    '/schedule',
    '/schedule-registration',
    '/shop',
    '/shop-detail/:id*',
    '/user',
    '/shop-detail/:id*',
    '/userDetailMock/:id*',
    '/decision-result',
    // ログインページにもミドルウェアを適用するため、'/login' を追加
    '/login',
    '/',
  ],
};
