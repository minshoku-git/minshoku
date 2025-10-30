import Box from '@mui/material/Box';
import * as React from 'react';
import { JSX } from 'react';

/**
 * 「必須」マークコンポーネント
 * @returns {JSX.Element} JSX
 */
const RequiredMark = (): JSX.Element => {
  return (
    <Box
      sx={{
        background: '#FF9900',
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
        px: '4px',
        py: '2px',
      }}
    >
      必須
    </Box>
  );
};

export default RequiredMark;
