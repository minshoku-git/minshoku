import { Avatar } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { JSX, useEffect } from 'react';

import { getWaitingApproval } from '@/app/_lib/getWaitingApproval/fetcher';
import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';
import { AlertType } from '@/app/_types/enum';
import { ApiResponse } from '@/app/_types/types';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

/**
 * 承認待ちユーザー数コンポーネント
 * @returns {JSX.Element} JSX
 */
export const WaitingApprovalBadge = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */

  /* useQuery
  ------------------------------------------------------------------ */
  const getWaitingApprovalFetch = async () => {
    return getWaitingApproval();
  };

  const { data: result } = useApiQuery<number>({
    queryKey: [QUERY_KEYS.WAITING_APPROVAL_SEARCH_RESULT],
    queryFn: getWaitingApprovalFetch,
    enabled: true,
    refetchOnWindowFocus: true, // window がフォーカスされたら再取得してくれる
  });

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {result && (
        <Avatar sx={{ bgcolor: '#f7514d', width: 28, height: 28, fontSize: 12 }}>{result}</Avatar>
      )}
    </>
  );
};
