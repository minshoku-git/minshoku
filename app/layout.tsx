import './globals.css';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { Metadata } from 'next';
import React from 'react';

import { DirtyProvider } from './_ui/dirty/dartyContext';
import { notoSansJp } from './_ui/fonts';
import ThemeProvider from './_ui/theme-provider';

/** @type {Metadata} metadata */
export const metadata: Metadata = {
  title: {
    default: 'みんなの社食',
    template: '%s | みんなの社食',
  },
  description: 'みんなの社食',
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
      <body className={notoSansJp.variable}>
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
