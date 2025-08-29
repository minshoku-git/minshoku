import { NextRequest } from 'next/server';

import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

/**
 * searchShopDetail
 * @param {ApiRequest<number>} req
 * @returns {Promise<any>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchShopDetail = (req: ApiRequest<number>): Promise<any> => {
  return fetcher<ApiResponse<number>>('/api/shopDetail/search', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * insertShopDetail
 * @param {FormData} formData
 * @returns {Promise<ApiResponse<number>>}
 */
export const insertShopDetail = (formData: FormData): Promise<ApiResponse<number>> => {
  return fetcher<ApiResponse<number>>('/api/shopDetail/insert', {
    method: 'POST',
    body: formData,
    //  headers.Content-Typeは指定しない。
  });
};

/**
 * updateShopDetail
 * @param {FormData} formData
 * @returns {Promise<ApiResponse<number>>}
 */
export const updateShopDetail = (formData: FormData): Promise<ApiResponse<number>> => {
  return fetcher<ApiResponse<number>>('/api/shopDetail/update', {
    method: 'PUT',
    body: formData,
    //  headers.Content-Typeは指定しない。
  });
};
