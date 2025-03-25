'use client';

import { Box } from '@mui/material';

import { OpenSnackBar } from '../_ui/snackBar/snackBar';
import { SnackBarProvider } from '../_ui/snackBar/snackbarContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SnackBarProvider>
      <OpenSnackBar />
      <Box>{children}</Box>
    </SnackBarProvider>
  );
}
