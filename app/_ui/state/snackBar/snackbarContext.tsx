'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';

import { AlertType } from '../../../_types/enum';
import { SnackBarType } from './snackBar';

// 1. グローバルなSnackbar表示関数を保持するための参照
// 初期値は安全のためログを出す関数にしておきます。
let globalOpenSnackbar = (alertType: AlertType, message: string): void => {
  console.warn("Snackbar function not yet initialized. Message:", message, "Type:", alertType);
};

// 2. 外部からSnackbar関数を設定するためのヘルパー関数
// これをAppコンポーネント内で呼び出し、useSnackBarの戻り値を設定します。
export const setGlobalOpenSnackbar = (func: (alertType: AlertType, message: string) => void): void => {
  globalOpenSnackbar = func;
};

// 3. QueryClientのonErrorで実際に呼び出す関数として、これをエクスポートします。
export const showGlobalSnackbar = (alertType: AlertType, message: string): void => {
  // AlertTypeとmessageの引数の順序を合わせるため、入れ替えて呼び出します。
  globalOpenSnackbar(alertType, message);
};

interface SnackBarContextType {
  snackbarState: SnackBarType;
  openSnackbar: (alertType: AlertType, message: string) => void;
  closeSnackbar: () => void;
}

const SnackBarContext = createContext<SnackBarContextType | null>({
  openSnackbar: () => { },
  closeSnackbar: () => { },
  snackbarState: {
    open: false,
    alertType: AlertType.INFO,
    message: '',
  },
});

export const SnackBarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbarState, setSnackbarState] = useState<SnackBarType>({
    open: false,
    alertType: AlertType.INFO,
    message: '',
  });

  const openSnackbar = (alertType: AlertType, message: string) => {
    setSnackbarState({ open: true, alertType, message });
  };

  const closeSnackbar = () => {
    setSnackbarState({ ...snackbarState, open: false });
  };

  return (
    <SnackBarContext.Provider value={{ snackbarState, openSnackbar, closeSnackbar }}>
      {children}
    </SnackBarContext.Provider>
  );
};

export const useSnackBar = (): SnackBarContextType => {
  const context = useContext(SnackBarContext);
  if (!context) {
    throw new Error('useSnackBar must be used within a SnackBarProvider');
  }
  return context;
};
