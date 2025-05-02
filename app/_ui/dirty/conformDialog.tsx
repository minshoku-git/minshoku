import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import * as React from 'react';
import { JSX } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  routerPush: () => void;
  closeConform: () => void;
}

/**
 * 処理中背景
 * @returns {JSX.Element} JSX
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, closeConform, routerPush }): JSX.Element => {
  return (
    <Dialog open={open} onClose={closeConform} sx={{ zIndex: 9999, position: 'absolute' }}>
      <DialogTitle>離脱確認</DialogTitle>
      <DialogContent>
        <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
          {'変更が保存されていません。\nこのページから移動してよろしいですか？'}
        </Typography>
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
