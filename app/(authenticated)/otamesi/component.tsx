import { Button } from '@mui/material';
import { useEffect, useState } from 'react';

import { useFormGuard } from '@/app/_lib/useFormGuard';

export function TestComponent() {
  const [isDirty, setIsDirty] = useState(false); // フォームが変更されたかどうか
  const [showDialog, setShowDialog] = useState(false); // カスタムダイアログを表示するかどうか

  const [pending, setPadding] = useState<boolean>(false);

  useFormGuard(true);

  useEffect(() => {
    if (!pending) return;

    function beforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [pending]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps
  const handleBeforeUnload = (event: any) => {
    if (isDirty) {
      event.preventDefault();
      event.returnValue = '';
      setShowDialog(true);
    }
  };

  useEffect(() => {
    handleBeforeUnload(event);

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload, isDirty]);

  // カスタムダイアログのコンポーネント（例）
  const CustomDialog = () => {
    return (
      <div>
        <p>変更が保存されていません。本当にページを離れますか？</p>
        <button onClick={() => setShowDialog(false)}>キャンセル</button>
        <button
          onClick={() => {
            // ページを離れる処理
            window.removeEventListener('beforeunload', handleBeforeUnload); // イベントリスナーを削除
            window.location.href = '/'; // 例：ホームページへリダイレクト
          }}
        >
          ページを離れる
        </button>
      </div>
    );
  };

  return (
    <div>
      <div id="test">
        <script src="url" async></script>
      </div>
      {/* フォームなどのコンテンツ */}
      <Button sx={{ marginTop: 0 }} onClick={() => setPadding(true)}>
        ボタンです
      </Button>
    </div>
  );
}

export default TestComponent;
