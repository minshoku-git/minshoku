import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { UserCsvData, UserListSearchResult, UserSearchFormValues } from './types';

/**
 * searchUserList
 * @param {ApiRequest<ApiRequest<UserSearchFormValues> | null>} req
 * @returns {Promise<ApiResponse<UserListSearchResult>>}
 */
export const searchUserListFetcher = async (
  req: ApiRequest<UserSearchFormValues> | null
): Promise<ApiResponse<UserListSearchResult>> => {
  return fetcher<ApiResponse<UserListSearchResult>>('/api/user/search', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * userListExportCsvFetcher
 * 検索条件に一致するユーザー情報をCSV出力用に全件取得する。
 * @param {ApiRequest<UserSearchFormValues> | null} req - 検索条件
 * @returns {Promise<ApiResponse<UserCsvData[]>>} CSV出力データ
 */
export const userListExportCsvFetcher = async (
  req: ApiRequest<UserSearchFormValues> | null
): Promise<ApiResponse<UserCsvData[]>> => {
  return fetcher<ApiResponse<UserCsvData[]>>('/api/user/exportCsv', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
