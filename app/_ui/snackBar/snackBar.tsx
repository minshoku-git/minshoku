import { Close } from '@mui/icons-material';
import { Box, Fade, IconButton, Slide, Typography } from '@mui/material';
import Alert, { AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { JSX, useEffect } from 'react';

import { AlertType } from '../../_types/enum';
import { useSnackBar } from './snackbarContext';

export type SnackBarType = {
  open: boolean;
  alertType: AlertType;
  message: string;
};

/**
 * OpenSnackBar
 * SnackBarの表示です。
 * @returns {JSX.Element} JSX
 */
export const OpenSnackBar = (): JSX.Element => {
  const { snackbarState, closeSnackbar } = useSnackBar();

  useEffect(() => {
    if (snackbarState.open) {
      setTimeout(() => {
        closeSnackbar();
      }, 10000); // 10秒間表示
    }
  }, [closeSnackbar, snackbarState.open]);

  return (
    <Snackbar
      sx={{ zIndex: 11000 }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={snackbarState.open}
      key={snackbarState.alertType.toString()}
    >
      <Alert severity={snackbarState.alertType as AlertColor} sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{snackbarState.message}</Typography>
          <IconButton aria-label="close" onClick={closeSnackbar} size={'small'}>
            <Close />
          </IconButton>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export { useSnackBar };
