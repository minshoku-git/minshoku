'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';

import { AlertType } from '../../_types/enum';
import { LoginFormValues, LoginSchema } from '../../_types/types';
import RequiredMark from '../../_ui/_shared/requiredMark';
import { useSnackBar } from '../../_ui/snackBar/snackbarContext';

export const LoginComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, control } = useForm<LoginFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 'xxxxx@refact.co.jp', // 実際は空
      password: '',
    },
  });

  /* functions 
  ------------------------------------------------------------------ */
  // 登録ハンドラー
  const submitHandler: SubmitHandler<LoginFormValues> = (data) => {
    // TODO:バリデーション通過後、APIを叩く。
    console.log(data);

    // API返却値によって処理を分岐する。
    if (true) {
      // OKの場合、画面遷移する。
      router.push('/schedule');
    } else {
      // NGの場合、スナックバーでエラーメッセージを出力する。
      openSnackbar(AlertType.ERROR, 'メールアドレスまたはパスワードが異なります。\n再度お試しください。');
    }
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <Container maxWidth="md">
      <Box>
        <form onSubmit={handleSubmit(submitHandler)}>
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
              <Typography variant="button">ログインする</Typography>
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};
