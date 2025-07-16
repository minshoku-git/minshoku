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
 * CSVダウンロードボタン
 * ※データ取得込み
 * @returns {JSX.Element}
 */
export const DownloadCsvButton = (props: props): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // サーバーAPIからデータを取得
      const response = await fetch('/api/testplace/csv');
      const data = await response.json();

      // 共通関数でCSV Blobを生成
      const blob = await createCsvBlob(data);

      // ダウンロード処理
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = props.fileName + 'users.csv';
      a.click();
      URL.revokeObjectURL(url);
      props.openSnackbar(AlertType.SUCCESS, 'CSVを出力しました。');
    } catch (error) {
      console.error('CSVダウンロード中にエラー:', error);
      props.openSnackbar(AlertType.ERROR, 'CSVダウンロード中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} startIcon={<Download />} variant="outlined" loading={loading}>
      CSV出力
    </Button>
  );
};
