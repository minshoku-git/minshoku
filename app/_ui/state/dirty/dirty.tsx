import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useDirty } from './dirtyContext';

/**
 * 処理中背景
 * @returns
 */
export const DirtyCheck = () => {
  const router = useRouter();
  const { isDirty, setDirty, openConform, setConformUrl } = useDirty();

  // 1.リロードボタン、外部サイトへの遷移
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (isDirty) {
      event.preventDefault();
      return (event.returnValue = '変更が保存されていません。\nこのページから移動してよろしいですか？');
    }
  };

  // 2.router.push
  const confirmNavigation = React.useCallback(
    (url: string) => {
      console.log('お呼び出しがかかりました');
      console.log('isDirty:', isDirty);
      if (isDirty) {
        setConformUrl(url);
        openConform();
        setDirty(false);
      } else {
        router.push(url);
      }
    },
    [isDirty, setConformUrl, openConform, setDirty, router]
  );

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
