import * as React from 'react';

import { UserApprovalType } from '@/app/_types/enum';
import { ApiResponse } from '@/app/_types/types';

import { DecisionResultComponent } from './component';

export type DecisionResult = {
  userApprovalType: UserApprovalType;
};

// 処理結果
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!token) {
    return <DecisionResultComponent result={undefined} />;
  }

  let res: ApiResponse<DecisionResult> | undefined = undefined;
  try {
    // TASK:サーバーAPI
    // 否認
    // 承認
    // 処理済み

    // data = await _searchCompanyDetail({ request: Number(id) });
    res = { success: true, data: { userApprovalType: UserApprovalType.APPROVAL } };
  } catch (e) {
    console.error('サーバーAPI取得失敗', e);
    res = { success: false, error: { code: (e as Error).message, message: '' } };
  } finally {
    return <DecisionResultComponent result={res} />;
  }
}
