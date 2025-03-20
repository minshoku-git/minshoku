'use client';

import { createTheme } from '@mui/material/styles';

/** theme */
const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-noto-sans-jp)',
  },
  cssVariables: true,
  // colorSchemes: {
  //   dark: true,
  // },
});
export default theme;
