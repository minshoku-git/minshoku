import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { LoginFormValues } from '@/app/(public)/login/_lib/types';

import { createClient } from './server';
import { t_administrator } from './tableTypes';

/**
 * ユーザー登録
 * @param email
 * @param password
 * @returns {Promise<ApiResponse<string>>}
 */
export const signUp = async (req: ApiRequest<LoginFormValues>): Promise<ApiResponse<string>> => {
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
      return { error: signUpError.message };
    }
    return { data: '' };
  } catch (error) {
    console.error('Error signing up:', error);
    return { error: (error as Error).message };
  }
};

/**
 * サインイン
 * @param email
 * @param password
 * @returns {Promise<ApiResponse<string>>}
 */
export const signIn = async (req: ApiRequest<LoginFormValues>): Promise<ApiResponse<string>> => {
  const supabase = await createClient();
  const { email, password } = req.request;

  console.log('email:', email);
  console.log('password:', password);

  try {
    // 1.ユーザー情報取得
    const query = supabase.from('t_administrator').select('*').eq('email', email).single();
    const { data, error } = (await query) as PostgrestSingleResponse<t_administrator>;

    if (error && !data) {
      console.error('Error signing in:', error);
      return { error: '入力されたメールアドレスは登録されていません。', data: '' };
    }

    // 2.サインイン
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      console.error('Error signing in:', signInError);
      return { error: 'ログイン処理に失敗しました。', data: '' };
    }
    return { data: '' };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      error: '例外が発生しました。再度お試しの上、繰り返しエラーが発生する場合は、管理者までお問合せください。',
      data: '',
    };
  }
};

/**
 * ログアウト
 * @returns {Promise<ApiResponse<string>>}
 */
export const signOut = async (): Promise<NextResponse> => {
  const supabase = await createClient();

  const { error: signOutError } = await supabase.auth.signOut();

  const response: NextResponse = NextResponse.json(signOutError ? { error: signOutError.message } : { success: true });

  // ✅ クッキーを強制削除
  response.cookies.set('sb-access-token', '', {
    maxAge: 0,
    path: '/',
  });
  response.cookies.set('sb-refresh-token', '', {
    maxAge: 0,
    path: '/',
  });

  return response;
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
      return { error: getUserError?.message ?? 'userdata none' };
    } else {
      console.log('User signed out:');
      return { data: '' };
    }
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: (error as Error).message };
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
      return {
        error: error.message,
      };
    }

    return {
      data: data?.id ? data.id : 0,
    };
  } catch (e) {
    return {
      error: (e as Error).message,
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
