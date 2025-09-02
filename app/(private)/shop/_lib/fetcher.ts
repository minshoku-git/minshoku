import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { ShopListSearchResult, ShopSearchFormValues } from './types';

/**
 * searchShopList
 * @param {ApiRequest<ShopSearchFormValues>} condition
 * @returns {Promise<ApiResponse<ShopListSearchResult[]>>}
 */
export const searchShopListFetcher = async (
  condition: ApiRequest<ShopSearchFormValues> | null
): Promise<ApiResponse<ShopListSearchResult[]>> => {
  return fetcher<ApiResponse<ShopListSearchResult[]>>('/api/shop/search', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
