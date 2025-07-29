import { ApiResponse } from '@/app/_types/types';

import { fetcher } from '../fetcher';

/**
 * getWaitingApproval
 * 承認待ちステータスのユーザー数を取得します
 * @returns {Promise<any>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getWaitingApproval = (): Promise<any> => {
  return fetcher<ApiResponse<number>>('/api/util/getWaitingApproval', {
    method: 'POST',
    body: null,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
