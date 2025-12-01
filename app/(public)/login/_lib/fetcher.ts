import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { LoginFormValues } from './types';

/**
 * loginFetcher
 * @param {ApiRequest<UpdateUserData>} req
 * @returns {Promise<ApiResponse<DecisionResult>>}
 */
export const loginFetcher = (req: ApiRequest<LoginFormValues>): Promise<ApiResponse<string>> => {
  return fetcher<ApiResponse<string>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
