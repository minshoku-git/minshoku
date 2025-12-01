'use client';

import { Download } from '@mui/icons-material';
import { Button } from '@mui/material';
import { JSX, useState } from 'react';

import { AlertType } from '@/app/_types/enum';

import { createCsvBlob } from './csvUtil';

type props = {
  /** ファイル名 */
  fileName: string;
  /** fetchAPI */
  fetchAPI: string;
  /** snapbar */
  openSnackbar: (alertType: AlertType, message: string) => void;
};

/**
 * CSVダウンロード
 * @returns {JSX.Element}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const downloadCsv = async (data: any): Promise<{ success: boolean }> => {
  try {
    // 共通関数でCSV Blobを生成
    const blob = await createCsvBlob(data);

    // ダウンロード処理
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'order.csv';
    a.click();
    URL.revokeObjectURL(url);

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('CSVダウンロード中にエラー:', error);
    return {
      success: false,
    };
  }
};