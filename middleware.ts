import { type NextRequest } from 'next/server';

import { updateSession } from './app/_lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
export const config = {
  // 認証時、閲覧可能なページ
  matcher: [
    '/company',
    '/companyDetail/:path*',
    '/order',
    '/schedule',
    '/scheduleRegistration',
    '/shop',
    '/shopDetail/:path*',
    '/user',
    '/userDetail/:path*',
    '/userDetailMock/:path*',
    '/decisionResult',
  ],
};
