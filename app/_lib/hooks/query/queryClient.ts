import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';

// 外部にエクスポートするQueryClientインスタンスを定義
export const queryClientInstance = newQueryClient();

/**
 * TanStack QueryのQueryClientインスタンスを作成・設定する関数
 * @returns 設定済みのQueryClientインスタンス
 */
function newQueryClient(): QueryClient {
  const clientInstance = new QueryClient({
    // ------------------------------------------------------------------
    // 1. デフォルトオプションの統一 (Global Defaults)
    // ------------------------------------------------------------------
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分間はStaleではないと見なす
        gcTime: 1000 * 60 * 30, // 30分間はキャッシュに残す (gcTime > staleTime)
        retry: 0, // リトライしない
        refetchOnWindowFocus: false, // ウィンドウフォーカス時のリフェッチを無効化
      },
    },
    // ------------------------------------------------------------------
    // 2. クエリエラーのグローバルロギングとSnackbar表示 (Fetching/useQuery)
    // ------------------------------------------------------------------
    queryCache: new QueryCache({
      // MEMO: エラーハンドリングは`useApiQuery`で実施する。キャッシュとクエリの状態管理のみ。
    }),
    // ------------------------------------------------------------------
    // 3. ミューテーションエラーのグローバルロギングとSnackbar表示 (Mutating/useMutation)
    // ------------------------------------------------------------------
    mutationCache: new MutationCache({
      // MEMO: エラーハンドリングは`useApiMutation`で実施する。キャッシュとクエリの状態管理のみ。
    }),
  });

  // 永続化の設定
  if (typeof window !== 'undefined') {
    // SSR環境でのエラー回避のため、windowの存在を確認
    persistQueryClient({
      queryClient: clientInstance,
      persister: createAsyncStoragePersister({ storage: window.localStorage }),
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          // 永続化対象のキーを定義
          const PERSIST_KEYS = [QUERY_KEYS.AUTH_STATUS];

          // queryKeyの最初の要素（メインキー）が永続化対象リストに含まれているか確認
          // queryKeyは配列なので、最初の要素（例: ['TOKEN_CHECK_RESULT', userId]）を確認
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const primaryKey: any = query.queryKey[0];

          return PERSIST_KEYS.includes(primaryKey);
        },
      },
    });
  }

  return clientInstance; // 修正: 作成したインスタンスを返す
}
