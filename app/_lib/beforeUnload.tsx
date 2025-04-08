import Backdrop from '@mui/material/Backdrop';
import * as React from 'react';

/**
 * 離脱確認ダイアログ
 * @returns {React.JSX.Element} React.JSX.Element
 */
export const OpenProcessing = (): React.JSX.Element => {
  const [open, setOpen] = React.useState<boolean>();
  const { handleBeforeUnload } = useCostomDialog();
  return (
    <div hidden={open}>
      <p>変更が保存されていません。本当にページを離れますか？</p>
      <button onClick={() => setOpen(false)}>キャンセル</button>
      <button
        onClick={() => {
          // ページを離れる処理
          window.removeEventListener('beforeunload', handleBeforeUnload); // イベントリスナーを削除
        }}
      >
        ページを離れる
      </button>
    </div>
  );
};

export default OpenProcessing;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useCostomDialog(): { handleBeforeUnload: any } {
  throw new Error('Function not implemented.');
}
