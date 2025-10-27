'use client';
import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { useProcessing } from '@/app/_ui/processing/processingContext';

import { AlertType } from '../../_types/enum';
import { useSnackBar } from '../../_ui/snackBar/snackbarContext';

/**
 * 実験用ページです。
 * @returns
 */
export const TestPlaceComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useForm
  ------------------------------------------------------------------ */

  /* functions 
  ------------------------------------------------------------------ */
  // メール送信
  const mailSendHandler = async () => {
    openProcessing();
    const req: ApiRequest<string> = {
      request: 'foo',
    };

    const response = await fetch('/api/testplace/mailSend', {
      method: 'POST',
      body: JSON.stringify(req),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res: ApiResponse<string> = await response.json();

    if (!res.success) {
      openSnackbar(AlertType.INFO, '送信に失敗しました！');
    } else {
      openSnackbar(AlertType.INFO, '送信しました！');
    }
    closeProcessing();
  };

  /** logOut */
  const logoutHandler = async () => {
    const response = await fetch('/api/login/logout', {
      method: 'POST',
    });
    const res = await response.json();
    if (!res.error) {
      router.refresh();
      console.log('いけました');
      openSnackbar(AlertType.INFO, 'ログアウト成功');
    } else {
      openSnackbar(AlertType.ERROR, res.error);
      console.log('あうと！');
    }
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <Container maxWidth="md">
      <Box>
        <Box
          sx={{
            marginTop: 4,
            rowGap: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '852px',
          }}
        >
          <Button variant="contained" onClick={() => mailSendHandler()} sx={{ display: 'flex', mb: 1.5, width: 240 }}>
            <Typography variant="button">メール送信</Typography>
          </Button>


          <Button variant="contained" onClick={() => logoutHandler()} sx={{ display: 'flex', mb: 1.5, width: 240 }}>
            <Typography variant="button">ログアウト</Typography>
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
