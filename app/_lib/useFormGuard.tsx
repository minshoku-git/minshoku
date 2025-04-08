import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// 作成中…
export const useFormGuard = (isDirty: boolean) => {
  const router = useRouter();

  useEffect(() => {
    // clickイベントの場合
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (event: any) => {
      console.log('isDirty ガード:' + isDirty);
      console.log('event.target:' + event.target); //event.target.getAttribute('data-url')
      console.log(event.target?.getAttribute('data-url')); //event.target.closest('a:not([target="_blank"]')
      console.log('aaaaaaaa:' + event.target.closest('a:not([target="_blank"]')); //event.target.closest('a:not([target="_blank"]')
      // // 変更あり　かつ　event.targetがElementであること　かつ aタグで[target="_blank"]ではない要素であること
      if (isDirty && event.target instanceof Element && event.target.closest('a:not([target="_blank"]')) {
        if (!window.confirm('ページを離れても良いですか？')) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    // 1.リロードボタン、外部サイトへの遷移
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    // 1.リロードボタン、外部サイトへの遷移
    window.addEventListener('beforeunload', handleBeforeUnload);
    // 2.Linkタグ、router.push()
    window.addEventListener('click', handleClick, true);

    return () => {
      // 1.リロードボタン、外部サイトへの遷移
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('click', handleClick, true);
    };
  }, [isDirty]);
};
