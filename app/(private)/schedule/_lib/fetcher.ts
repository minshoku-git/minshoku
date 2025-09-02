import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { ScheduleListSearchResult, ScheduleSearchFormValues } from './types';

/**
 * searchShopDetail
 * @param {ApiRequest<ScheduleSearchFormValues> | null} req
 * @returns {Promise<ApiResponse<ScheduleListSearchResult>>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchScheduleListFetcher = (
  req: ApiRequest<ScheduleSearchFormValues> | null
): Promise<ApiResponse<ScheduleListSearchResult>> => {
  return fetcher<ApiResponse<ScheduleListSearchResult>>('/api/schedule/search', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
