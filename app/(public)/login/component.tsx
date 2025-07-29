'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { useProcessing } from '@/app/_ui/processing/processingContext';

import { AlertType } from '../../_types/enum';
import RequiredMark from '../../_ui/_shared/requiredMark';
import { useSnackBar } from '../../_ui/snackBar/snackbarContext';
import { LoginFormValues, LoginSchema } from './_lib/types';

export const LoginComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  const [loading, setLoading] = useState(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, control, getValues } = useForm<LoginFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 's.abe@refact.co.jp', // TODO:実際は空、モック中は値有りで
      password: 'example-password',
    },
  });

  /* functions 
  ------------------------------------------------------------------ */
  // ログインハンドラー
  const loginHandler: SubmitHandler<LoginFormValues> = async (data) => {
    setLoading(true);

    try {
      const req: ApiRequest<LoginFormValues> = { request: data };
      const response = await fetch('/api/login/signIn', {
        method: 'POST',
        body: JSON.stringify(req),
      });
      const res: ApiResponse<string> = await response.json();

      if (!res.error) {
        router.push('/schedule');
      } else {
        setLoading(false);
        console.log(res.error);
        openSnackbar(AlertType.ERROR, res.error);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      openSnackbar(AlertType.ERROR, 'ログインに失敗しました。再度お試しください。');
    }
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <Container maxWidth="md">
      <Box>
        <form onSubmit={handleSubmit(loginHandler)}>
          <Box
            sx={{
              marginTop: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '852px',
            }}
          >
            <Image src="/logo.svg" alt="みんなの社食" width="200" height="52" />
            <Box sx={{ my: 2, width: 280 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', mb: 0.5 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  メールアドレス
                </Typography>
                <RequiredMark />
              </Box>
              <TextFieldElement
                control={control}
                fullWidth
                size="small"
                name="email"
                type="email"
                autoComplete="email"
              />
            </Box>
            <Box sx={{ mb: 4, width: 280 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', mb: 0.5 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  パスワード
                </Typography>
                <RequiredMark />
              </Box>
              <TextFieldElement
                control={control}
                fullWidth
                size="small"
                name="password"
                type="password"
                autoComplete="current-password"
                value={'password'}
              />
            </Box>
            <Button variant="contained" type={'submit'} sx={{ display: 'flex', mb: 1.5, width: 240 }} loading={loading}>
              <Typography variant="button">ログインする</Typography>
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};
