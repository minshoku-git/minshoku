import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import * as React from 'react';
import { JSX } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  routerPush: () => void;
  closeConform: () => void;
  title: string;
  message: string;
}

/**
 * 確認ダイアログ
 * @returns {JSX.Element} JSX
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  closeConform,
  routerPush,
  title,
  message,
}): JSX.Element => {
  return (
    <Dialog open={open} onClose={closeConform} sx={{ zIndex: 10100, position: 'absolute' }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ mb: '5px' }}>
        <Button
          variant="contained"
          onClick={() => {
            routerPush();
            closeConform();
          }}
        >
          OK
        </Button>
        <Button variant="outlined" onClick={() => closeConform()}>
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
