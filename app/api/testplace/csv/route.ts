import { NextResponse } from 'next/server';

export async function GET() {
  const users = [
    { 年齢: '10', 名前: 'イチロー' },
    { 年齢: '20', 名前: 'ジロー' },
    { 年齢: '30', 名前: 'サブロー' },
  ];
  return NextResponse.json(users);
}
