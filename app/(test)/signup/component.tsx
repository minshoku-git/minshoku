'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, Typography } from '@mui/material';
import Image from 'next/image';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';
import { LoginFormValues, LoginSchema } from '@/app/(public)/login/_lib/types';

import { AlertType } from '../../_types/enum';
import RequiredMark from '../../_ui/components/atoms/requiredMark';

/**
 * サインアップ
 * 管理者を登録します
 * @returns
 */
export const SignUpComponent = () => {
  /* initialize
    ------------------------------------------------------------------ */
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, control, getValues } = useForm<LoginFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 's.abe@refact.co.jp', // TODO:実際は空、モック中は値有りで
      password: 'example-password',
    },
  });

  /* functions 
  ------------------------------------------------------------------ */
  // 登録ハンドラー
  const singUpHandler: SubmitHandler<LoginFormValues> = async (data) => {
    openProcessing();

    try {
      const req: ApiRequest<LoginFormValues> = {
        request: getValues(),
      };
      const response = await fetch('/api/login/signUp', {
        method: 'POST',
        body: JSON.stringify(req),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const res: ApiResponse<string> = await response.json();

      // API返却値によって処理を分岐する。
      if (res.success) {
        // OKの場合、画面遷移する。
        openSnackbar(AlertType.INFO, '登録完了メールを確認してください。');
      } else {
        // NGの場合、スナックバーでエラーメッセージを出力する。
        openSnackbar(AlertType.ERROR, 'メールアドレスまたはパスワードが異なります。\n再度お試しください。');
      }
    } catch (error) {
      // NGの場合、スナックバーでエラーメッセージを出力する。
      openSnackbar(AlertType.ERROR, 'メールアドレスまたはパスワードが異なります。\n再度お試しください。');
    } finally {
      closeProcessing();
    }
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <Container maxWidth="md">
      <Box>
        <form onSubmit={handleSubmit(singUpHandler)}>
          <Box
            sx={{
              marginTop: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '852px',
            }}
          >
            <Image src="/logo.png" alt="みんなの社食" width="200" height="52" />
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
            <Button variant="contained" type={'submit'} sx={{ display: 'flex', mb: 1.5, width: 240 }}>
              <Typography variant="button">登録</Typography>
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};
