import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { UpdateUserData, UserDataDetailRequest, UserDetailFormValues } from './types';

/**
 * searchUserDetail
 * @param {ApiRequest<number>} req
 * @returns {Promise<any>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchUserDetail = (req: ApiRequest<number>): Promise<any> => {
  return fetcher<ApiResponse<number>>('/api/userDetail/search', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * updateUserDetail
 * @param {ApiRequest<UserDetailFormValues>} req
 * @returns {Promise<ApiResponse<number>>}
 */
export const updateUserDetail = (req: ApiRequest<UserDataDetailRequest>): Promise<ApiResponse<number>> => {
  return fetcher<ApiResponse<number>>('/api/userDetail/update', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * pullback 引き戻し承認
 * @param {ApiRequest<number>} req
 * @returns {Promise<ApiResponse<number>>}
 */
export const pullbackFetcher = (req: ApiRequest<UserDataDetailRequest>): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/userDetail/pull-back', {
    method: 'PUT',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * updateUserDetail
 * @param {ApiRequest<UpdateUserData>} req
 * @returns {Promise<ApiResponse<number>>}
 */
export const disapproval = (req: ApiRequest<UpdateUserData>): Promise<ApiResponse<number>> => {
  return fetcher<ApiResponse<number>>('/api/userDetail/disapproval', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * updateUserDetail
 * @param {ApiRequest<UpdateUserData>} req
 * @returns {Promise<ApiResponse<number>>}
 */
export const approval = (req: ApiRequest<UpdateUserData>): Promise<ApiResponse<number>> => {
  return fetcher<ApiResponse<number>>('/api/userDetail/approval', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
