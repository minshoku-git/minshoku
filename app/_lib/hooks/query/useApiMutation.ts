import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { AlertType } from '@/app/_types/enum';
import { ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { MUTATE_FAILURE_MESSAGE } from '@/app/errors/ErrorCodes';

import { showGlobalSnackbar } from '../../../_ui/state/snackBar/snackbarContext';

// ----------------------------------------------------------------------
// 💡 ApiError (success: false) を自動処理し、onSuccess の引数を成功型に絞り込むカスタムフック
// ----------------------------------------------------------------------

// 成功レスポンスのみを抽出するユーティリティ型
// Tが ApiSuccess<D> の構造を持つ場合、その構造を返します。
type SuccessResponse<T> = T extends { success: true; data: infer D } ? { success: true; data: D } : never;

// useMutationに渡すオプションから onSuccess を除外し、成功型に絞り込んだ onSuccess を再定義
type UseApiMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<ApiResponse<TData>, unknown, TVariables, unknown>,
  'onSuccess'
> & {
  // onSuccess の引数 data は SuccessResponse<ApiResponse<TData>> に絞り込まれます。
  onSuccess?: (
    data: SuccessResponse<ApiResponse<TData>>, // 成功型のみを強制 (ApiErrorは含まれない)
    variables: TVariables,
    context: unknown
  ) => unknown;
};

/**
 * APIレスポンスのエラー(success: false)を自動的に検知し、Snackbarを表示するカスタムミューテーションフック。
 * ネットワークエラーはグローバルの MutationCache.onError で処理されます。
 */
export const useApiMutation = <TData, TVariables>(options: UseApiMutationOptions<TData, TVariables>) => {
  return useMutation({
    ...options,

    // 成功時の処理
    onSuccess: (data, variables, context) => {
      if (options.onSuccess) {
        options.onSuccess(data as SuccessResponse<ApiResponse<TData>>, variables, context);
      }
    },

    // エラー時の処理
    onError: (error) => {
      // CustomError がインスタンスの場合、スナックバーにエラーメッセージを表示
      if (error instanceof CustomError) {
        // CustomError の場合、エラーメッセージを表示
        showGlobalSnackbar(AlertType.ERROR, error.message);
        console.error('Custom Error:', error.code, error.message); // ログに詳細を出力
      } else {
        // 予期しないエラーの場合、より詳細なエラーメッセージを表示
        showGlobalSnackbar(AlertType.ERROR, MUTATE_FAILURE_MESSAGE);
        console.error('Unexpected Error:', error); // 予期しないエラーをログに出力
      }
    },
  });
};
