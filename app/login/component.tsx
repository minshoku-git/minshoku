'use client';
import { Box, Button, Container, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';

import RequiredMark from '../../app/_ui/shared/requiredMark';

/* TODO：types & schema */
export type LoginFormValues = {
  password: string;
  email: string;
};

export const LoginComponent = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const loginHandler = () => {
    router.push('/user');
  };

  const { register, reset, handleSubmit, formState, control } = useForm<LoginFormValues>({
    defaultValues: {
      password: '',
      email: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  return (
    <Container maxWidth="md">
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
            error={false}
            onChange={() => {}}
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
            error={false} //isPasswordError
            onChange={() => {}}
          />
        </Box>
        <Button variant="contained" onClick={loginHandler} sx={{ display: 'flex', mb: 1.5, width: 240 }}>
          <Typography variant="button">ログインする</Typography>
        </Button>
        {/* <PasswordModal
          isOpen={openPasswordModal}
          setIsOpen={setOpenPasswordModal}
          shopUserId={shopsLoginId}
          shopsId={shopsId}
        />
        <MailAddressModal
          isOpen={openMailAddressModal}
          setIsOpen={setOpenMailAddressModal}
        /> */}
      </Box>
    </Container>
  );
};
