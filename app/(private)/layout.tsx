'use client';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, Link, ListSubheader } from '@mui/material';
import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps } from '@mui/material';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import * as React from 'react';

import { AlertType } from '../_types/enum';
import { ApiResponse } from '../_types/types';
import { WaitingApprovalBadge } from '../_ui/_shared/waitingApprovalBadge';
import ConfirmDialog from '../_ui/dirty/conformDialog';
import { useDirty } from '../_ui/dirty/dartyContext';
import DirtyCheck from '../_ui/dirty/dirty';
import { OpenProcessing } from '../_ui/processing/processing';
import { ProcessingProvider } from '../_ui/processing/processingContext';
import { OpenSnackBar, useSnackBar } from '../_ui/snackBar/snackBar';
import { SnackBarProvider } from '../_ui/snackBar/snackbarContext';

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
  const router = useRouter();
  const queryClient = new QueryClient();
  const currentPathname = usePathname();
  const [open, setOpen] = useState(true);
  const { isDirty, setDirty, openConfirmDialog, closeConform, url } = useDirty();
  const { confirmNavigation } = DirtyCheck();
  const { openSnackbar } = useSnackBar();

  /* functions - Header 
  ------------------------------------------------------------------ */
  /** メニューを開く */
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  /** メニューを閉じる */
  const handleDrawerClose = () => {
    setOpen(false);
  };
  /** 表示中画面のメニューボタンを非活性化 */
  const disabledTitle = (pathname: string) => {
    return currentPathname === pathname;
  };

  /** logout */
  const logoutHandler = async () => {
    const response = await fetch('/api/login/logout', {
      method: 'POST',
    });
    const res = await response.json() as ApiResponse<null>;
    if (res.success) {
      router.refresh();
    } else {
      openSnackbar(AlertType.ERROR, res.error.message)
    }
  };

  /* functions - 離脱確認ダイアログ
  ------------------------------------------------------------------ */
  /** リンク先を開く */
  const pushHandler = () => {
    setDirty(false);
    router.push(url!);
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <SnackBarProvider>
      <QueryClientProvider client={queryClient}>
        <ProcessingProvider>
          {/* snackバー表示 */}
          <OpenSnackBar />
          {/* 読込中表示 */}
          <OpenProcessing />
          {/* 離脱確認ダイアログ */}
          <ConfirmDialog
            open={openConfirmDialog}
            routerPush={() => pushHandler()}
            closeConform={() => closeConform()}
            title={'離脱確認'}
            message={`変更が保存されていません。\nこのページから移動してよろしいですか？`}
          />
          {/* 全体 */}
          <Box sx={{ display: 'flex' }}>
            {/* ヘッダー */}
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
                  src="/logo.svg"
                  alt="みんなの社食"
                  width="200"
                  height="52"
                  // Largest Contentful Paint (LCP) 要素として検出された画像だと警告がでるので、以下のように設定した
                  priority={true}
                  fetchPriority={'auto'}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Link href="/login">
                  <Button className="underline" color="inherit" onClick={() => logoutHandler()}>
                    ログアウト
                  </Button>
                </Link>
              </Toolbar>
            </AppBar>
            {/* サイドメニュー */}
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
                  <ChevronLeftIcon />
                </IconButton>
              </DrawerHeader>
              <Divider />
              <List disablePadding subheader={<ListSubheader>提供スケジュール</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    onClick={() => {
                      confirmNavigation('/schedule');
                    }}
                    disabled={disabledTitle('/schedule')}
                  >
                    <ListItemText primary={'スケジュール一覧'} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    onClick={() => {
                      confirmNavigation('/scheduleRegistration');
                    }}
                    disabled={disabledTitle('/scheduleRegistration')}
                  >
                    <ListItemText primary={'スケジュール登録'} />
                  </ListItemButton>
                </ListItem>
              </List>
              <List disablePadding subheader={<ListSubheader>店舗情報</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    onClick={() => {
                      confirmNavigation('/shop');
                    }}
                    disabled={disabledTitle('/shop')}
                  >
                    <ListItemText primary={'店舗一覧'} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    onClick={() => {
                      confirmNavigation('/shopDetail/-');
                    }}
                    disabled={disabledTitle('/shopDetail/-')}
                  >
                    <ListItemText primary={'店舗新規登録'} />
                  </ListItemButton>
                </ListItem>
              </List>
              <List disablePadding subheader={<ListSubheader>会社情報</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    onClick={() => {
                      confirmNavigation('/company');
                    }}
                    disabled={disabledTitle('/company')}
                  >
                    <ListItemText primary={'会社一覧'} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    onClick={() => {
                      confirmNavigation('/companyDetail/-');
                    }}
                    disabled={disabledTitle('/companyDetail/-')}
                  >
                    <ListItemText primary={'会社新規登録'} />
                  </ListItemButton>
                </ListItem>
              </List>
              <List disablePadding subheader={<ListSubheader>ユーザー情報</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    onClick={() => {
                      confirmNavigation('/user');
                    }}
                    disabled={disabledTitle('/user')}
                  >
                    <ListItemText primary={'ユーザー一覧'} />
                    <WaitingApprovalBadge />
                  </ListItemButton>
                </ListItem>
              </List>
              <List disablePadding subheader={<ListSubheader>オーダー情報</ListSubheader>}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="button"
                    onClick={() => {
                      confirmNavigation('/order');
                    }}
                    disabled={disabledTitle('/order')}
                  >
                    <ListItemText primary={'オーダー一覧'} />
                  </ListItemButton>
                </ListItem>
              </List>
            </Drawer>
            {/* メインコンテンツ */}
            <Main open={open} sx={{ position: 'sticky' }}>
              <DrawerHeader />
              <Box sx={{ width: '1000px', mx: 'auto' }}>{children}</Box>
            </Main>
          </Box>
        </ProcessingProvider>
      </QueryClientProvider>
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
