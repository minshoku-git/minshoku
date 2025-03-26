import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import * as React from 'react';

/** プロパティ */
type Props = {
  /** 表示判定 */
  open: boolean;
};

/**
 * 処理中背景
 * @param {Props} props - プロパティ
 * @returns {JSX.Element} JSX
 */
const Processing = (props: Props): React.JSX.Element => {
  return (
    <Backdrop
      open={props.open}
      sx={{
        color: '#ff4500',
        background: 'rgba(255,255,255,0.50)',
        zIndex: 1350,
        size: '4rem',
      }}
    >
      <CircularProgress color="inherit" size="3rem" />
    </Backdrop>
  );
};

export default Processing;
