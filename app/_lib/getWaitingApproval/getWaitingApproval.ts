import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { UserRegistrationStatus } from '../../_types/enum';
import { ApiResponse } from '../../_types/types';
import { createClient } from '../supabase/server';
import { t_user } from '../supabase/tableTypes';

/**
 * 承認待ちユーザー取得結果
 */
export type WaitingApprovalData = {
  // 件数
  count: number;
};

/**
 * getWaitingApproval
 * 承認待ちステータスのユーザー数を取得します
 *
 * @returns {number} 承認待ちステータスのユーザー数
 */
export const getWaitingApproval = async (): Promise<ApiResponse<number>> => {
  const supabase = await createClient();

  try {
    /* 件数取得
      ------------------------------------------------------------------ */
    const queryCount = supabase
      .from('t_user')
      .select('id', { count: 'exact', head: true })
      .eq('user_registration_status', UserRegistrationStatus.WAITING_APPROVAL);
    const { count, error: countError } = (await queryCount) as PostgrestSingleResponse<t_user>;

    if (countError) {
      console.error(countError);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '承認待ちステータスのユーザー数取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }
    return { success: true, data: count ?? 0 };
  } catch (e: unknown) {
    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
