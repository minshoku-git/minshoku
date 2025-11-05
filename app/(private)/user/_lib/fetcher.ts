import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { UserListSearchResult, UserSearchFormValues } from './types';

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
