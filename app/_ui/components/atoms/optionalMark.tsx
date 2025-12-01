import Box from '@mui/material/Box';
import * as React from 'react';
import { JSX } from 'react';

/**
 * 「任意」マークコンポーネント
 * @returns {JSX.Element} JSX
 */
const OptionalMark = (): JSX.Element => {
  return (
    <Box
      sx={{
        background: '#6aa84f',
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
        px: '4px',
        py: '2px',
      }}
    >
      任意
    </Box>
  );
};

export default OptionalMark;
