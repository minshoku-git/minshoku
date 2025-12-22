import { Avatar } from '@mui/material';
import { JSX } from 'react';

import { getWaitingApproval } from '@/app/_lib/getWaitingApproval/fetcher';
import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';

/**
 * 承認待ちユーザー数コンポーネント
 * @returns {JSX.Element} JSX
 */
export const WaitingApprovalBadge = (): JSX.Element => {
  /* useQuery
  ------------------------------------------------------------------ */
  const getWaitingApprovalFetch = async () => {
    return getWaitingApproval();
  };

  const { data: result, isLoading } = useApiQuery<number>({
    queryKey: [QUERY_KEYS.WAITING_APPROVAL_SEARCH_RESULT],
    queryFn: getWaitingApprovalFetch,
    enabled: true,
    refetchOnWindowFocus: true, // window がフォーカスされたら再取得してくれる
    staleTime: 0 // データの賞味期限を0に。常に取得する。
  });

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {!isLoading && result ? (
        <Avatar sx={{ bgcolor: '#f7514d', width: 28, height: 28, fontSize: 12 }}>{result}</Avatar>
      ) : <></>}
    </>
  );
};
