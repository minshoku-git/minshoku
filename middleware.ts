import { type NextRequest } from 'next/server';

import { updateSession } from './app/_lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
export const config = {
  // 認証時、閲覧可能なページ
  matcher: [
    '/company',
    '/company-detail/:path*',
    '/order',
    '/schedule',
    '/schedule-registration',
    '/shop',
    '/shop-detail/:path*',
    '/user',
    '/shop-detail/:path*',
    '/userDetailMock/:path*',
    '/decision-result',
  ],
};
