import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { CompanyDetailFormValues } from './types';

/**
 * searchCompanyDetail
 * @param {ApiRequest<number>} req
 * @returns {Promise<any>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchCompanyDetail = (req: ApiRequest<number>): Promise<any> => {
  return fetcher<ApiResponse<number>>('/api/companyDetail/search', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const insertCompanyDetail = (data: CompanyDetailFormValues) => {
  return fetcher('/api/companyDetail/insert', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateCompanyDetail = (data: CompanyDetailFormValues) => {
  return fetcher('/api/companyDetail/update', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
