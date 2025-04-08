'use client';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, Link, ListSubheader, Typography } from '@mui/material';
import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps } from '@mui/material';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { styled, useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import * as React from 'react';

import { DirtyProvider, useDirty } from '../_ui/DartyContext';
import DirtyCheck from '../_ui/Dirty';
import OpenProcessing from '../_ui/processing/processing';
import { ProcessingProvider } from '../_ui/processing/processingContext';
import { OpenSnackBar } from '../_ui/snackBar/snackBar';
import { SnackBarProvider } from '../_ui/snackBar/snackbarContext';

const drawerWidth = 240;

// AppBarの型を拡張
interface AppBarProps extends MuiAppBarProps {
  open?: boolean; // openプロパティを追加
}

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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const router = useRouter();
  const currentPathname = usePathname();
  const [open, setOpen] = useState(true);
  const { isDirty } = useDirty();
  const { confirmNavigation } = DirtyCheck();

  const linkHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const url = e.currentTarget.getAttribute('data-url');
    router.push(url!);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const disabledTitle = (pathname: string) => {
    return currentPathname === pathname;
  };

  React.useEffect(() => {
    console.log('親コンポーネントのisDirty:', isDirty);
    // 親コンポーネント内でsetDirtyを呼び出す
  }, [isDirty]);

  return (
    <SnackBarProvider>
      <ProcessingProvider>
        <DirtyProvider>
          <OpenSnackBar />
          <OpenProcessing />
          <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" open={open} sx={styles.appBar}>
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  sx={[{ mr: 2 }, open && { display: 'none' }]}
                >
                  <MenuIcon />
                </IconButton>
                <Image
                  src="/logo.png"
                  alt="みんなの社食"
                  width="200"
                  height="52"
                  // Largest Contentful Paint (LCP) 要素として検出された画像だと警告がでるので、以下のように設定した
                  priority={true}
                  fetchPriority={'auto'}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Link href="/login">
                  <Button className="underline" color="inherit" onClick={async () => {}}>
                    ログアウト
                  </Button>
                </Link>
              </Toolbar>
            </AppBar>
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                },
              }}
              variant="persistent"
              anchor="left"
              open={open}
            >
              <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
              </DrawerHeader>
              <Divider />
              <List subheader={<ListSubheader>提供スケジュール</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    data-url="/schedule"
                    disabled={disabledTitle('/schedule')}
                    onClick={linkHandler}
                  >
                    <ListItemText primary={'スケジュール一覧'} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    data-url="/scheduleRegistration"
                    onClick={() => {
                      confirmNavigation('/scheduleRegistration');
                    }}
                    disabled={disabledTitle('/scheduleRegistration')}
                  >
                    <ListItemText primary={'スケジュール登録'} />
                  </ListItemButton>
                </ListItem>
              </List>
              <List subheader={<ListSubheader>店舗情報</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    data-url="/shop"
                    onClick={linkHandler}
                    disabled={disabledTitle('/shop')}
                  >
                    <ListItemText primary={'店舗一覧'} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    data-url="/shopDetail"
                    onClick={() => {
                      confirmNavigation('/shopDetail');
                    }}
                    disabled={disabledTitle('/shopDetail')}
                  >
                    <ListItemText primary={'店舗新規登録'} />
                  </ListItemButton>
                </ListItem>
              </List>
              <List subheader={<ListSubheader>会社情報</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    data-url="/company"
                    onClick={linkHandler}
                    disabled={disabledTitle('/company')}
                  >
                    <ListItemText primary={'会社一覧'} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    data-url="/companyDetail"
                    onClick={linkHandler}
                    disabled={disabledTitle('/companyDetail')}
                  >
                    <ListItemText primary={'会社新規登録'} />
                  </ListItemButton>
                </ListItem>
              </List>
              <List subheader={<ListSubheader>ユーザー情報</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    data-url="/user"
                    onClick={linkHandler}
                    disabled={disabledTitle('/user')}
                  >
                    <ListItemText primary={'ユーザー一覧'} />
                  </ListItemButton>
                </ListItem>
              </List>
              <List subheader={<ListSubheader>オーダー情報</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    data-url="/order"
                    onClick={linkHandler}
                    disabled={disabledTitle('/order')}
                  >
                    <ListItemText primary={'オーダー一覧'} />
                  </ListItemButton>
                </ListItem>
              </List>
            </Drawer>
            <Main open={open} sx={{ position: 'sticky' }}>
              <DrawerHeader />
              <Box sx={{ width: '1000px', mx: 'auto' }}>{children}</Box>
            </Main>
          </Box>
        </DirtyProvider>
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
