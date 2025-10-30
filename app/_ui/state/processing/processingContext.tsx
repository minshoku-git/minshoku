'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type ProcessingType = {
  open: boolean;
};

interface ProcessingContextType {
  processingState: ProcessingType;
  openProcessing: () => void;
  closeProcessing: () => void;
}

const ProcessingContext = createContext<ProcessingContextType | null>({
  openProcessing: () => {},
  closeProcessing: () => {},
  processingState: { open: false },
});

export const ProcessingProvider = ({ children }: { children: ReactNode }) => {
  const [processingState, setProcessingState] = useState<ProcessingType>({ open: false });

  const openProcessing = () => {
    setProcessingState({ open: true });
  };

  const closeProcessing = () => {
    setProcessingState({ open: false });
  };

  return (
    <ProcessingContext.Provider value={{ processingState, openProcessing, closeProcessing }}>
      {children}
    </ProcessingContext.Provider>
  );
};

export const useProcessing = (): ProcessingContextType => {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error('useProcessing must be used within a ProcessingContext');
  }
  return context;
};
