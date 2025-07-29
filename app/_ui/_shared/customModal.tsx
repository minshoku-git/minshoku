import { Close } from '@mui/icons-material';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { JSX } from 'react';

const ModalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '1px solid #DDD',
  borderRadius: '8px',
  boxShadow:
    '0px 5px 5px -3px rgb(100 100 100 / 20%), 0px 8px 10px 1px rgb(100 100 100 / 14%), 0px 3px 14px 2px rgb(100 100 100 / 12%)',
  px: 4,
  py: 4,
  maxWidth: '90vw',
  maxHeight: '90vh',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

/** CustomModalコンポーネントプロパティ */
type CustomModalProps = {
  /** children */
  children: React.ReactNode;
  /** title、デフォルト："" */
  title?: string;
  /** 幅、単位：px、デフォルト：auto */
  width?: number;
  /** 高さ、単位：px、デフォルト：auto */
  height?: number;
  /** 表示状態 */
  open: boolean;
  /** closeイベント */
  onClose: VoidFunction;
};

/**
 * CustomModalコンポーネント。
 * モーダルの土台です。
 * @returns {JSX.Element} JSX
 */
const CustomModal = (props: CustomModalProps): JSX.Element => {
  /** title */
  const title = props.title !== undefined ? props.title : '';
  /** 幅 */
  const width = props.width !== undefined ? props.width : 'auto';
  /** 高さ */
  const height = props.height !== undefined ? props.height : 'auto';

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Box sx={ModalStyle} width={width} height={height}>
        <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
          {title !== '' && (
            <Typography component="h2" variant="h6" color="primary">
              {title}
            </Typography>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" type="submit" color="info" startIcon={<Close />} onClick={props.onClose}>
            閉じる
          </Button>
        </Box>
        <Box
          sx={{
            overflowY: 'auto',
            flexGrow: 1,
            minHeight: 0, // flexの中でスクロール可能にするため必要
          }}
        >
          {props.children}
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomModal;
