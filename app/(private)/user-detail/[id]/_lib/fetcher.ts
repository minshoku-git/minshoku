import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import {
  UpdateUserData,
  UserDataDetailRequest,
  UserDataDetailResult,
  UserDetailFormValues,
  UserDetailInitValues,
} from './types';

/**
 * ユーザー詳細情報取得
 * @param {ApiRequest<UserDetailInitValues>} req
 * @returns {Promise<UserDataDetailResult>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchUserDetail = (req: ApiRequest<UserDetailInitValues>): Promise<ApiResponse<UserDataDetailResult>> => {
  return fetcher<ApiResponse<UserDataDetailResult>>('/api/user-detail/search', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * ユーザー情報更新
 * @param {ApiRequest<UserDetailFormValues>} req
 * @returns {Promise<ApiResponse<null>>}
 */
export const updateUserDetail = (req: ApiRequest<UserDataDetailRequest>): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/user-detail/update', {
    method: 'PUT',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * 否認
 * @param {ApiRequest<UpdateUserData>} req
 * @returns {Promise<ApiResponse<null>>}
 */
export const disapproval = (req: ApiRequest<UpdateUserData>): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/user-detail/disapproval', {
    method: 'PUT',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * 承認
 * @param {ApiRequest<UpdateUserData>} req
 * @returns {Promise<ApiResponse<null>>}
 */
export const approval = (req: ApiRequest<UpdateUserData>): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/user-detail/approval', {
    method: 'PUT',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * 引き戻し承認
 * @param {ApiRequest<number>} req
 * @returns {Promise<ApiResponse<null>>}
 */
export const pullbackFetcher = (req: ApiRequest<UserDataDetailRequest>): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/user-detail/pull-back', {
    method: 'PUT',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
