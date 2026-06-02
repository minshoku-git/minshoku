import { fetcher } from '@/app/_lib/fetcher';
import { ApiResponse } from '@/app/_types/types';
import { ScheduleRegistrationResult } from './types';

/**
 * upsertScheduleFetcher
 * @param {FormData} formData
 * @returns {Promise<ApiResponse<ScheduleRegistrationResult>>} ★型を変更
 */
export const upsertScheduleFetcher = (
  formData: FormData
): Promise<ApiResponse<ScheduleRegistrationResult>> => {
  return fetcher<ApiResponse<ScheduleRegistrationResult>>('/api/schedule-registration/insert', {
    method: 'POST',
    body: formData,
  });
};