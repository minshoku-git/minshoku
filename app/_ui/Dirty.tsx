import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useDirty } from './DartyContext';

/**
 * 処理中背景
 * @returns
 */
export const DirtyCheck = () => {
  const router = useRouter();
  const { isDirty, setDirty } = useDirty();

  const atai = setDirty((s) => s);
  console.log('atai:' + atai);
  React.useEffect(() => {
    if (isDirty) {
      console.log('isDirtyがtrueになりました');
    } else {
      console.log('isDirtyがfalseになりました');
    }
  }, [isDirty]);

  // 1.リロードボタン、外部サイトへの遷移
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (isDirty) {
      console.log('リロードが動作しています');
      event.preventDefault();
      return (event.returnValue = '変更が保存されていません。\nこのページから移動してよろしいですか？');
    }
  };

  // 1.router.pushなど
  const confirmNavigation = (url: string) => {
    console.log('やあ動いているよ');
    console.log('Dirty.tsxのisDirty:' + isDirty);
    if (isDirty) {
      const confirmLeave = window.confirm('変更が保存されていません。\nこのページから移動してよろしいですか？');
      if (confirmLeave) {
        router.push(url);
      }
    } else {
      router.push(url);
    }
  };

  React.useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  return { confirmNavigation };
};

export default DirtyCheck;
