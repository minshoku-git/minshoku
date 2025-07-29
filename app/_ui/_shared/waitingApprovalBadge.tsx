import { Avatar } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { JSX, useEffect } from 'react';

import { getWaitingApproval } from '@/app/_lib/getWaitingApproval/fetcher';
import { AlertType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiResponse } from '@/app/_types/types';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

/**
 * 承認待ちユーザー数コンポーネント
 * @returns {JSX.Element} JSX
 */
export const WaitingApprovalBadge = (): JSX.Element => {
  /* initialize
    ------------------------------------------------------------------ */
  const { openSnackbar } = useSnackBar();

  /* useQuery
    ------------------------------------------------------------------ */
  const getWaitingApprovalFetch = async () => {
    return getWaitingApproval();
  };

  const { data: result, isError } = useQuery<ApiResponse<number>>({
    queryKey: [QUERY_KEYS.WAITING_APPROVAL_SEARCH_RESULT],
    queryFn: getWaitingApprovalFetch,
    enabled: true,
    refetchOnWindowFocus: true, // window がフォーカスされたら再取得してくれる
  });

  /* useEffect
    ------------------------------------------------------------------ */
  useEffect(() => {
    if (!result) {
      return
    }
    if (!result.success) {
      openSnackbar(AlertType.WARNING, result.error.message);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  /* JSX
    ------------------------------------------------------------------ */
  return (
    <>
      {result?.success && (
        <Avatar sx={{ bgcolor: '#f7514d', width: 28, height: 28, fontSize: 12 }}>{result.data}</Avatar>
      )}{' '}
    </>
  );
};
