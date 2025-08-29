import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'querystring';

import { decrypt } from '@/app/_lib/encryption/crypto';
import { approval } from '@/app/_lib/supabase/test';

/**
 * 承認
 * @param req
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const decryptedQuery = decrypt(token);
  const queryObject = parse(decryptedQuery);

  const res = await approval(token);
  console.log(`クリック記録: user_id = ${token}`);

  if (!res.success) {
    return NextResponse.redirect(new URL('/login', req.url));
  } else {
    return NextResponse.redirect(new URL('/decision-result', req.url));
  }
}
