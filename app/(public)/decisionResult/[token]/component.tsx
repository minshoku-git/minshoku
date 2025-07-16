'use client';
import { Box, Button, Divider, Grid2 as Grid, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { JSX } from 'react';

import { UserApprovalType } from '@/app/_types/enum';
import { ApiResponse } from '@/app/_types/types';

import { DecisionResult } from './page';

type props = {
  result?: ApiResponse<DecisionResult>;
};

/**
 * 処理結果Component
 * @returns {JSX.Element} JSX
 */
export const DecisionResultComponent = (props: props): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const result: DecisionResult | null = props.result?.data ?? null;

  /* useState
  ------------------------------------------------------------------ */

  /* useForm
  ------------------------------------------------------------------ */

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
            margin: '5%',
          }}
        >
          <Grid container alignItems="center">
            <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ px: 3, py: 2, mb: 0 }}>
              {`処理結果 - 承認完了`}
            </Typography>
          </Grid>
          <Divider />
          <Box sx={{ m: 3 }}>
            {result && (
              <>
                {UserApprovalType.APPROVAL === result.userApprovalType && (
                  <>
                    <Typography>ユーザーの承認処理が完了しました。</Typography>
                  </>
                )}
                {UserApprovalType.DISAPPROVAL === result.userApprovalType && (
                  <>
                    <Typography>ユーザーの否認処理が完了しました。</Typography>
                  </>
                )}
                {UserApprovalType.PROCESSED === result.userApprovalType && (
                  <>
                    <Typography>このユーザーの承認フローはすでに完了しています。</Typography>
                  </>
                )}
              </>
            )}
          </Box>
          <Box sx={{ m: 3 }}>
            <Button variant="contained" onClick={() => goToLoginPage()} sx={{ display: 'flex', mb: 1.5, width: 240 }}>
              <Typography variant="button">ログイン画面</Typography>
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};
