import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { LoginFormValues } from '@/app/(public)/login/_lib/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { createClient } from './server';
import { t_administrator } from './tableTypes';

/**
 * ユーザー登録
 * @param email
 * @param password
 * @returns {Promise<ApiResponse<string>>}
 */
export const signUp = async (req: ApiRequest<LoginFormValues>): Promise<ApiResponse<null>> => {
  const supabase = await createClient();
  const { email, password } = req.request;

  console.log('email:', email);
  console.log('password:', password);

  try {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Error signing up:', signUpError);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ユーザー登録' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }
    return { success: true, data: null };
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

/**
 * ユーザー取得
 * @returns {Promise<ApiResponse<string>>}
 */
export const getUser = async (): Promise<ApiResponse<string>> => {
  const supabase = await createClient();

  try {
    const { data, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !data?.user) {
      console.error('Error signing out:', getUserError);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ログイン' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }
    console.log('User signed out:');
    return { success: true, data: '' };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);

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

/**
 * 承認
 * @param email
 * @param password
 * @returns {Promise<void>}
 */
export const approval = async (id: string): Promise<ApiResponse<number>> => {
  const supabase = await createClient();
  try {
    const query = supabase
      .from('test')
      .insert({
        user_id: id,
      })
      .select('id')
      .single();
    const { error, data } = (await query) as PostgrestSingleResponse<test>;
    if (error) {
      console.log(error.message);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ユーザー情報の承認' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    return { success: true, data: data?.id ? data.id : 0 };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);

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

/** テストテーブル */
type test = {
  /** ID（メニュースケジュールID） */
  id?: number;
  /** 企業ID */
  user_id?: string;
  /** 登録日時 */
  created_at?: Date;
};
