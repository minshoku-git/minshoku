'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';

import { AlertType } from '../../_types/enum';
import { SnackBarType } from './snackBar';

// 後でゆっくり確認する…
interface SnackBarContextType {
  snackbarState: SnackBarType;
  openSnackbar: (alertType: AlertType, message: string) => void;
  closeSnackbar: () => void;
}

const SnackBarContext = createContext<SnackBarContextType | null>({
  openSnackbar: () => {},
  closeSnackbar: () => {},
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
