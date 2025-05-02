'use client';

import { Box } from '@mui/material';

import { OpenProcessing } from '../../_ui/processing/processing';
import { ProcessingProvider } from '../../_ui/processing/processingContext';
import { OpenSnackBar } from '../../_ui/snackBar/snackBar';
import { SnackBarProvider } from '../../_ui/snackBar/snackbarContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SnackBarProvider>
      <ProcessingProvider>
        <OpenSnackBar />
        <OpenProcessing />
        <Box>{children}</Box>
      </ProcessingProvider>
    </SnackBarProvider>
  );
}
