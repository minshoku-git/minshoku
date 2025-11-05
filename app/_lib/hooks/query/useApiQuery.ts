import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { AlertType } from '@/app/_types/enum';
import { ApiResponse, ApiSuccess } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { FETCH_FAILURE_MESSAGE } from '@/app/errors/ErrorCodes';

import { showGlobalSnackbar } from '../../../_ui/state/snackBar/snackbarContext';

// ----------------------------------------------------------------------
// 💡 カスタム useApiQuery フックのオプション定義
// ----------------------------------------------------------------------
type UseApiQueryOptions<TQueryFnData, TData, TQueryKey extends readonly unknown[]> = Omit<
  UseQueryOptions<ApiResponse<TQueryFnData>, unknown, TData, TQueryKey>,
  'select' | 'queryFn' | 'initialData' // TanStack Queryの型を上書き
> & {
  // queryFnは必ず ApiResponse<TQueryFnData> を返すことを強制
  queryFn: (context: { signal?: AbortSignal }) => Promise<ApiResponse<TQueryFnData>>;

  // initialDataも ApiResponse<TQueryFnData> 型で受け取る
  initialData?: ApiResponse<TQueryFnData> | (() => ApiResponse<TQueryFnData>);
};

/**
 * APIレスポンスのエラー(success: false)を自動的に検知し、
 * QueryClientのグローバルonErrorに処理を委譲するカスタムクエリフック。
 * * @param options - TanStack Queryオプション。queryFnは ApiResponse<T> を返します。
 */
export const useApiQuery = <
  TQueryFnData,
  TData = TQueryFnData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TQueryKey extends [string, ...any[]] = [string, ...any[]],
>(
  options: UseApiQueryOptions<TQueryFnData, TData, TQueryKey>
) => {
  const wrappedQueryFn = async (context: { signal?: AbortSignal }): Promise<ApiResponse<TQueryFnData>> => {
    try {
      const response = await options.queryFn(context);
      return response;
    } catch (error) {
      if (error instanceof CustomError) {
        // CustomError の場合、エラーメッセージを表示
        showGlobalSnackbar(AlertType.ERROR, error.message);
        console.error('Custom Error:', error.code, error.message); // ログに詳細を出力
        return Promise.reject(error);
      } else {
        // 予期しないエラーの場合、より詳細なエラーメッセージを表示
        showGlobalSnackbar(AlertType.ERROR, FETCH_FAILURE_MESSAGE);
        console.error('Unexpected Error:', error); // 予期しないエラーをログに出力
        return Promise.reject(error);
      }
    }
  };

  // 最終的な useQuery 呼び出し
  return useQuery<ApiResponse<TQueryFnData>, unknown, TData, TQueryKey>({
    ...options,
    queryFn: wrappedQueryFn,

    // データの抽出をフック内部で強制し、コンポーネント側の .data アクセスを不要にする
    // 成功レスポンスから純粋なデータ (TQueryFnData) を抽出する
    select: (res) => (res as ApiSuccess<TQueryFnData>).data as unknown as TData,
  });
};
