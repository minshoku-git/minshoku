import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient } from '@/app/_lib/supabase/server';
import { t_administrator } from '@/app/_lib/supabase/tableTypes';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { LoginFormValues } from './types';

/**
 * サインイン
 * @param email
 * @param password
 * @returns {Promise<ApiResponse<string>>}
 */
export const signIn = async (req: ApiRequest<LoginFormValues>): Promise<ApiResponse<string>> => {
  const supabase = await createClient();
  const { email, password } = req.request;

  try {
    // 1.ユーザー情報取得
    const query = supabase.from('t_administrator').select('*').eq('email', email).single();
    const { error } = (await query) as PostgrestSingleResponse<t_administrator>;

    if (error) {
      // MEMO: メールアドレスの特定を避けるためにサインインエラーと同じエラーを出力
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ログイン' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    // 2.サインイン
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      console.error('Error signing in:', signInError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ログイン' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }
    return { success: true, data: '' };
  } catch (e: unknown) {
    console.error(e);
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
