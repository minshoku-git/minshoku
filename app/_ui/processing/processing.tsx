import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import * as React from 'react';

import { useProcessing } from './processingContext';

/**
 * 処理中背景
 * @returns {React.JSX.Element} React.JSX.Element
 */
export const OpenProcessing = (): React.JSX.Element => {
  const { processingState } = useProcessing();
  return (
    <Backdrop
      open={processingState.open}
      sx={{
        color: '#1976d2',
        background: 'rgba(255,255,255,0.50)',
        zIndex: 20,
        size: '4rem',
      }}
    >
      <CircularProgress color="inherit" size="3rem" />
    </Backdrop>
  );
};

export default OpenProcessing;
