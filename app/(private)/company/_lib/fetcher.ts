import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { CompanyListSearchResult, CompanySearchFormValues } from './types';

/**
 * searchOrderList
 * @param {ApiRequest<ApiRequest<CompanySearchFormValues> | null>} condition
 * @returns {Promise<ApiResponse<CompanyListSearchResult>>}
 */
export const searchCompanyListFetcher = async (
  condition: ApiRequest<CompanySearchFormValues> | null
): Promise<ApiResponse<CompanyListSearchResult>> => {
  return fetcher<ApiResponse<CompanyListSearchResult>>('/api/company/search', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
