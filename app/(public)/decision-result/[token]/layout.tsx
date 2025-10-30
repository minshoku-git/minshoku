'use client';

import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { OpenSnackBar } from '@/app/_ui/state/snackBar/snackBar';
import { SnackBarProvider } from '@/app/_ui/state/snackBar/snackbarContext';

import { OpenProcessing } from '../../../_ui/state/processing/processing';
import { ProcessingProvider } from '../../../_ui/state/processing/processingContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SnackBarProvider>
        <ProcessingProvider>
          <OpenSnackBar />
          <OpenProcessing />
          <Box>{children}</Box>
        </ProcessingProvider>
      </SnackBarProvider>
    </QueryClientProvider>
  );
}
