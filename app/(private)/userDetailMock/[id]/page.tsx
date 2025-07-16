import { redirect } from 'next/navigation';

import { ApiResponse } from '@/app/_types/types';

import { UserDataDetailResult } from './_lib/types';
import { _searchUserDetail } from './_lib/userDetailFuction';
import { UserDetailComponent } from './component';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data: UserDataDetailResult | null = null;

  try {
    const res: ApiResponse<UserDataDetailResult> = await _searchUserDetail({ request: Number(id) });

    data = res.data;
    if (res.error) {
      console.log(res.error);
      redirect('/user');
    }
  } catch (e) {
    console.error('サーバーAPI取得失敗', e);
    redirect('/user');
  }

  return <UserDetailComponent data={data} />;
}
