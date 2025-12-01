'use client';

import { Box } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClientInstance } from '@/app/_lib/hooks/query/queryClient';
import { OpenSnackBar } from '@/app/_ui/state/snackBar/snackBar';
import { SnackBarProvider } from '@/app/_ui/state/snackBar/snackbarContext';
import { SnackBarInitializer } from '@/app/_ui/state/snackBar/snackBarInitializer';

import { OpenProcessing } from '../../_ui/state/processing/processing';
import { ProcessingProvider } from '../../_ui/state/processing/processingContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SnackBarProvider>
      <SnackBarInitializer />
      <QueryClientProvider client={queryClientInstance}>
        <ProcessingProvider>
          <OpenSnackBar />
          <OpenProcessing />
          <Box>{children}</Box>
        </ProcessingProvider>
      </QueryClientProvider>
    </SnackBarProvider>
  );
}
