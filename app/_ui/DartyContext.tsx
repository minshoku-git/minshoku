'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DirtyContextType {
  setDirty: React.Dispatch<React.SetStateAction<boolean>>;
  isDirty: boolean;
}
const DirtyContext = createContext<DirtyContextType | null>({
  setDirty: () => {},
  isDirty: false,
});

export const DirtyProvider = ({ children }: { children: ReactNode }) => {
  const [isDirty, setDirty] = useState<boolean>(false);

  return <DirtyContext.Provider value={{ isDirty, setDirty }}>{children}</DirtyContext.Provider>;
};

export const useDirty = (): DirtyContextType => {
  const context = useContext(DirtyContext);
  if (!context) {
    throw new Error('useDirty must be used within a DirtyContext');
  }
  return context;
};
