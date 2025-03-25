import { Close } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import Alert, { AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { AlertType } from '../../_types/enum';
import { useSnackBar } from './snackbarContext';

export type SnackBarType = {
  open: boolean;
  alertType: AlertType;
  message: string;
};

export const OpenSnackBar = () => {
  const { snackbarState, closeSnackbar } = useSnackBar();

  return (
    <Snackbar
      sx={{ zIndex: 99999 }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={snackbarState.open}
      key={snackbarState.alertType.toString()}
    >
      <Alert severity={snackbarState.alertType as AlertColor} sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>{snackbarState.message}</Typography>
          <IconButton aria-label="close" onClick={closeSnackbar} size={'small'}>
            <Close />
          </IconButton>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export { useSnackBar };
