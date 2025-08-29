import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { DecisionData, DecisionResult } from './types';

/**
 * decision
 * @param {ApiRequest<UpdateUserData>} req
 * @returns {Promise<ApiResponse<DecisionResult>>}
 */
export const decision = (req: ApiRequest<DecisionData>): Promise<ApiResponse<DecisionResult>> => {
  return fetcher<ApiResponse<DecisionResult>>('/api/decision-result/decision', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
