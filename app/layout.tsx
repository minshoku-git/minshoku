// Noto Sans JP はパッケージ同梱のフォントファイルを使う（next/font/google はビルドのたびに
// Google から取得するため、取得の一時エラーでビルドが失敗していた）。font-family は globals.css の --font-noto-sans-jp。
import '@fontsource/noto-sans-jp/300.css';
import '@fontsource/noto-sans-jp/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';
import './globals.css';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { Metadata } from 'next';
import React from 'react';

import { DirtyProvider } from './_ui/state/dirty/dirtyContext';
import ThemeProvider from './_ui/theme-provider';

/** @type {Metadata} metadata */
export const metadata: Metadata = {
  title: {
    default: 'みんなの社食',
    template: '%s | みんなの社食',
  },
  description: 'みんなの社食',

  // 検索エンジンにインデックスさせない設定（noindex, nofollow）
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Layout
 * @param {React.ReactNode} children
 * @returns
 */
const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  /* jsx
  ---------------------------------------------------------------------------------------------------- */
  return (
    <html lang="ja">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <DirtyProvider>{children}</DirtyProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
};
export default Layout;
