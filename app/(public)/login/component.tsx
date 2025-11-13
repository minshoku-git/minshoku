'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Container, IconButton, InputAdornment, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';

import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { ApiRequest } from '@/app/_types/types';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

import RequiredMark from '../../_ui/components/atoms/requiredMark';
import { loginFetcher } from './_lib/fetcher';
import { LoginFormValues, LoginSchema } from './_lib/types';

export const LoginComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();

  /* useState
  ------------------------------------------------------------------ */
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, control, formState: { isDirty } } = useForm<LoginFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: zodResolver(LoginSchema),
    // defaultValues: {
    //   email: 'admin@domain.co.jp', // TODO:実際は空、モック中は値有りで
    //   password: 'password1',
    // },
    defaultValues: {
      email: '', // TODO:実際は空、モック中は値有りで
      password: '',
    },
  });

  /* functions 
  ------------------------------------------------------------------ */
  // ログインハンドラー
  const loginHandler: SubmitHandler<LoginFormValues> = async (data) => {
    loginMutate.mutate(data)
  };

  const loginMutate = useApiMutation({
    mutationFn: async (data: LoginFormValues) => {
      setLoading(true);
      const req: ApiRequest<LoginFormValues> = { request: data };
      return loginFetcher(req);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <Container maxWidth="md">
      <Box>
        <form noValidate onSubmit={handleSubmit(loginHandler)}>
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
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                size="small"
                control={control}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Box>
            <Button variant="contained" type={'submit'} disabled={!isDirty} sx={{ display: 'flex', mb: 1.5, width: 240 }} loading={loading}>
              <Typography variant="button">ログインする</Typography>
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};
