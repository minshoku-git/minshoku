import { fetcher } from '@/app/_lib/fetcher';
import { ApiResponse } from '@/app/_types/types';

/**
 * searchShopDetail
 * @param {FormData} formData
 * @returns {Promise<ApiResponse<number>>}
 */
export const upsertScheduleFetcher = (formData: FormData): Promise<ApiResponse<number>> => {
  return fetcher<ApiResponse<number>>('/api/schedule-registration/insert', {
    method: 'POST',
    body: formData,
    //  headers.Content-Typeは指定しない。
  });
};
