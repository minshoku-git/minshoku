'use client';

import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import type { Palette, Theme } from '@mui/material/styles';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import type { TypographyOptions } from '@mui/material/styles/createTypography';

/** @type {TypographyOptions | ((palette: Palette) => TypographyOptions)} typography */
const typography: TypographyOptions | ((palette: Palette) => TypographyOptions) = {
  fontFamily: 'var(--font-noto-sans-jp)',
};
/** @type {boolean} cssVariables */
const cssVariables: boolean = true;

/** @type {Theme} lightTheme */
const lightTheme: Theme = createTheme({
  typography,
  cssVariables,
  palette: {
    mode: 'light',
    text: {
      primary: '#333333', // デフォルトのテキストカラー（スタイルが適用されていない場合）
    },
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#fafafa',
          borderBottom: '3px double lightGray',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: '1px solid lightGray',
        },
      },
    },
    MuiPagination: {
      defaultProps: {
        color: 'primary',
        shape: 'rounded',
        size: 'large',
      },
      styleOverrides: {
        root: {},
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          fontSize: '16px',
          color: 'black',
          backgroundColor: '#fafafa',
          marginTop: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: '#1976d2',
          fontWeight: 'bold',
          paddingLeft: 32,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          margin: '0 !important',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          '&.confirm': {
            backgroundColor: 'green', // IDが my-button-id のボタンを緑色に変更
            color: 'white',
            '&:hover': {
              backgroundColor: 'darkgreen', // ホバー時の色を変更
            },
          },
        },
      },
    },
  },
});

/** @type {Theme} darkTheme */
const darkTheme = createTheme({
  typography,
  cssVariables,
  palette: {
    mode: 'dark',
  },
});

/** モーダルスタイル */
export const DateTimePickerStyle = {
  width: '150px',
  '& .MuiInputBase-root': {
    height: '40px',
    textAlign: 'center',
    verticalAlign: 'center',
    padding: '0 15px',
  },
  '& input': {
    padding: '0',
  },
};

/**
 * ThemeProvider
 * @param {React.ReactNode} children
 * @returns
 */
const ThemeProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  /* カラースキーム
  ---------------------------------------------------------------------------------------------------- */
  const mode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';

  /* jsx
  ---------------------------------------------------------------------------------------------------- */
  return (
    <MuiThemeProvider theme={lightTheme}>
      {/* <MuiThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}> */}
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
export default ThemeProvider;
