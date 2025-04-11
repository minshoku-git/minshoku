'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DirtyContextType {
  isDirty: boolean;
  setDirty: (flag: boolean) => void;
  openConfirmDialog: boolean;
  openConform: () => void;
  closeConform: () => void;
  url: string;
  setConformUrl: (url: string) => void;
}
const DirtyContext = createContext<DirtyContextType | null>({
  // 変更有無
  isDirty: false,
  setDirty: () => {},
  // 離脱確認ダイアログ表示
  openConfirmDialog: false,
  openConform: () => {},
  closeConform: () => {},
  // 遷移先URL
  url: '',
  setConformUrl: () => {},
});

export const DirtyProvider = ({ children }: { children: ReactNode }) => {
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');

  const setDirty = (flag: boolean) => {
    setIsDirty(flag);
  };

  const openConform = () => {
    setOpenConfirmDialog(true);
  };

  const closeConform = () => {
    setOpenConfirmDialog(false);
  };

  const setConformUrl = (url: string) => {
    setUrl(url);
  };

  return (
    <DirtyContext.Provider
      value={{
        isDirty,
        setDirty,
        openConfirmDialog,
        openConform,
        closeConform,
        url,
        setConformUrl,
      }}
    >
      {children}
    </DirtyContext.Provider>
  );
};

export const useDirty = (): DirtyContextType => {
  const context = useContext(DirtyContext);
  if (!context) {
    throw new Error('useDirty must be used within a DirtyContext');
  }
  return context;
};
