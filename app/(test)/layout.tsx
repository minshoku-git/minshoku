'use client';
import { Box } from '@mui/material';
import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import * as React from 'react';

import DirtyCheck from '../_ui/state/dirty/dirty';
import { useDirty } from '../_ui/state/dirty/dirtyContext';
import { OpenProcessing } from '../_ui/state/processing/processing';
import { ProcessingProvider } from '../_ui/state/processing/processingContext';
import { OpenSnackBar } from '../_ui/state/snackBar/snackBar';
import { SnackBarProvider } from '../_ui/state/snackBar/snackbarContext';
const drawerWidth = 240;

/* AppBarの型を拡張
------------------------------------------------------------------ */
interface AppBarProps extends MuiAppBarProps {
  open?: boolean; // openプロパティを追加
}

/* Main
------------------------------------------------------------------ */
const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));

/* AppBar
------------------------------------------------------------------ */
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

/* DrawerHeader
------------------------------------------------------------------ */
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

/* RootLayout
------------------------------------------------------------------ */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* initialize
  ------------------------------------------------------------------ */
  const [open] = useState(true);

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <SnackBarProvider>
      <ProcessingProvider>
        {/* snackバー表示 */}
        <OpenSnackBar />
        {/* 読込中表示 */}
        <OpenProcessing />
        {/* 全体 */}
        <Box sx={{ display: 'flex' }}>
          {/* メインコンテンツ */}
          <Main open={open} sx={{ position: 'sticky' }}>
            <DrawerHeader />
            <Box sx={{ width: '1000px', mx: 'auto' }}>{children}</Box>
          </Main>
        </Box>
      </ProcessingProvider>
    </SnackBarProvider>
  );
}

/* style
---------------------------------------------------------------------------------------------------- */
/** @type {{ [key: string]: React.CSSProperties }} style */
const styles: { [key: string]: React.CSSProperties } = {
  // コンテナ
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100svh',
  },
  // メインコンテナ
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '32px',
  },
  // ボタン
  button: {
    width: '50%',
  },
  // AppBar
  appBar: {
    color: 'gray',
    backgroundColor: '#FFF',
  },
};
