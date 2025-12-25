import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import {
  OrderCancelValues,
  OrderDetailInitValues,
  orderDeteilCsvResponseData,
  orderDeteilResponseData,
  OrderListSearchResult,
  OrderSearchFormValues,
} from './types';

/**
 * searchOrderList
 * @param {ApiRequest<ApiRequest<OrderSearchFormValues> | null>} condition
 * @returns {Promise<ApiResponse<OrderListSearchResult>>}
 */
export const searchOrderListFetcher = async (
  condition: ApiRequest<OrderSearchFormValues> | null
): Promise<ApiResponse<OrderListSearchResult>> => {
  return fetcher<ApiResponse<OrderListSearchResult>>('/api/order/search', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * searchOrderList
 * @param {ApiRequest<OrderDetailInitValues>} condition
 * @returns {Promise<ApiResponse<orderDeteilResponseData>>}
 */
export const searchOrderDetailFetcher = async (
  condition: ApiRequest<OrderDetailInitValues> | null
): Promise<ApiResponse<orderDeteilResponseData>> => {
  return fetcher<ApiResponse<orderDeteilResponseData>>('/api/order/searchDetail', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * orderCancel
 * @param {ApiRequest<OrderCancelValues>} req
 * @returns {Promise<ApiResponse<number>>}
 */
export const orderCancelFetcher = (req: ApiRequest<OrderCancelValues>): Promise<ApiResponse<number>> => {
  return fetcher<ApiResponse<number>>('/api/order/orderCancel', {
    method: 'PUT',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * searchOrderList
 * @param {ApiRequest<ApiRequest<OrderSearchFormValues> | null>} condition
 * @returns {Promise<ApiResponse<orderDeteilCsvResponseData[]>>}
 */
export const orderListExportCSVFetcher = async (
  condition: ApiRequest<OrderSearchFormValues> | null
): Promise<ApiResponse<orderDeteilCsvResponseData[]>> => {
  return fetcher<ApiResponse<orderDeteilCsvResponseData[]>>('/api/order/exportCsv', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
