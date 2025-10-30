'use client';
import { Box, Button, Grid2 as Grid, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { JSX, useEffect } from 'react';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { AlertType, UserApprovalType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

import { decisionFetcher } from './_lib/fetcher';
import { DecisionData, DecisionResult } from './_lib/types';

/**
 * 処理結果Component
 * @returns {JSX.Element} JSX
 */
export const DecisiondataComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();
  const userApprovalType = (useParams().token as string) ?? '';
  const token = useSearchParams().get('token') ?? '';

  /* useQuery
  ------------------------------------------------------------------ */
  const decisionFetch = async () => {
    const req: ApiRequest<DecisionData> = { request: { userApprovalType, token } }
    return decisionFetcher(req);
  };

  const {
    data: result,
    isLoading,
  } = useQuery<ApiResponse<DecisionResult>>({
    queryKey: [QUERY_KEYS.DECISION_INIT],
    queryFn: decisionFetch,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!result) {
      return;
    }
    if (!result.success) {
      openSnackbar(AlertType.ERROR, result.error.message);
      // router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (isLoading) {
      openProcessing();
    } else {
      closeProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  /* functions 
  ------------------------------------------------------------------ */

  // ログイン画面遷移
  const goToLoginPage = () => {
    router.push('/login');
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Box>
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '440px',
            mx: 'auto',
            my: '40px'
          }}
        >
          <Box sx={{ mx: 'auto', mt: 3 }}>
            <Image
              src="/logo.svg"
              alt="みんなの社食"
              width="200"
              height="52"
              // Largest Contentful Paint (LCP) 要素として検出された画像だと警告がでるので、以下のように設定した
              priority={true}
              fetchPriority={'auto'}
            />
          </Box>
          <Grid container alignItems="center">
            <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ px: 3, py: 2, mx: 'auto', mb: 0 }}>
              {`処理結果`}
            </Typography>
          </Grid>
          {/* <Divider /> */}
          <Box sx={{ mx: 'auto' }}>
            {result?.success && (
              <>
                {UserApprovalType.APPROVAL === result.data.userApprovalType && (
                  <>
                    <Typography>ユーザーの承認処理が完了しました。</Typography>
                  </>
                )}
                {UserApprovalType.DISAPPROVAL === result.data.userApprovalType && (
                  <>
                    <Typography>ユーザーの否認処理が完了しました。</Typography>
                  </>
                )}
                {UserApprovalType.PROCESSED === result.data.userApprovalType && (
                  <>
                    <Typography>このユーザーの承認フローはすでに完了しています。</Typography>
                  </>
                )}
              </>
            )}
          </Box>
          <Box sx={{ m: 3, mt: 5 }}>
            <Button variant="contained" onClick={() => goToLoginPage()} sx={{ display: 'flex', mx: 'auto', mb: 1.5, width: 240 }}>
              <Typography variant="button">ログイン画面</Typography>
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};
