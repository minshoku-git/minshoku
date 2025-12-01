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
    <>
      {processingState.open && (
        <Backdrop
          open={processingState.open}
          sx={{
            color: '#fff',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 110000,
          }}
        >
          <CircularProgress color="inherit" size="5rem" />
        </Backdrop>
      )}
    </>
  );
};

export { useProcessing };
