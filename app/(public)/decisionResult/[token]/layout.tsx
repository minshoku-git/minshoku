'use client';

import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { OpenProcessing } from '../../../_ui/processing/processing';
import { ProcessingProvider } from '../../../_ui/processing/processingContext';
import { OpenSnackBar } from '../../../_ui/snackBar/snackBar';
import { SnackBarProvider } from '../../../_ui/snackBar/snackbarContext';

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
