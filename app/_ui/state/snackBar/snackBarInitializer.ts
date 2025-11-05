'use client';
import { useEffect } from 'react';

import { setGlobalOpenSnackbar, useSnackBar } from './snackbarContext';

/**
 * SnackBarInitializer
 * useSnackBarフックを呼び出し、そのopenSnackbar関数を
 * QueryClientのonErrorから呼び出せるようにグローバル変数に設定します。
 * このコンポーネントは SnackBarProvider の子孫として配置する必要があります。
 */
export const SnackBarInitializer = () => {
  // 💡 SnackBarProvider の内側なので、フックを安全に呼び出せます
  const { openSnackbar } = useSnackBar();

  useEffect(() => {
    // openSnackbar (Hooksの戻り値) を、グローバル変数に設定
    setGlobalOpenSnackbar(openSnackbar);
  }, [openSnackbar]);

  // このコンポーネント自体はUIをレンダリングしないため null を返します
  return null;
};
