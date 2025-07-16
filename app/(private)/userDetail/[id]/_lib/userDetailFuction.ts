import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { getNow } from '@/app/_lib/getDateTime';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_user } from '@/app/_lib/supabase/tableTypes';
import { getPostgreSqlItems } from '@/app/_lib/utill';
import { ERROR_MESSAGE } from '@/app/_types/constants';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { UserDataDetailResult, UserDetailFormValues } from './types';

/* ユーザー詳細
------------------------------------------------------------------ */

/**
 * get_userDetail
 * IDに一致するユーザー情報を取得する。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<UserDetailFormValues>} 検索結果
 */
export const _searchUserDetail = async (values: ApiRequest<number>): Promise<ApiResponse<UserDataDetailResult>> => {
  const supabase = await createClient();

  try {
    const query = supabase
      .from('t_user')
      .select(
        `id,
      user_name,
      user_name_kana,
      user_registration_status,
      usage_status,
      user_email,
      master_memo,
      t_companies_id,
      t_companies!inner(
        company_name,
        branch_name,
        optional_item_title_1,
        optional_item_notes_1,
        optional_item_title_2,
        optional_item_notes_2
      ),
      t_companies_department!inner(
        department_name
      ),  
      t_companies_employment_status!inner(
        employment_status_name
      )`
      )
      .eq('id', values.request)
      .single();

    const { data, error } = (await query) as PostgrestSingleResponse<UserDataDetailResult>;

    if (error) {
      console.error(error);
      return { error: 'ユーザー情報の取得' + ERROR_MESSAGE.TEMPLATE };
    }

    return {
      data: {
        ...data,
        usage_status: data.usage_status as UsageStatus,
        user_registration_status: data.user_registration_status.toString() as UserRegistrationStatus,
      },
    };
  } catch (error) {
    console.error(error);
    return { error: ERROR_MESSAGE.UNEXPECTED };
  }
};

/**
 * _updateUserRegistrationStatus
 * IDに一致するユーザー情報を更新する。
 *
 * @param {ApiRequest<UserDetailFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<number>>} 検索結果
 */
export const _updateUserDetail = async (values: ApiRequest<UserDetailFormValues>): Promise<ApiResponse<number>> => {
  const supabase = await createClient();

  const req = values.request;
  const timestamp = getNow();
  try {
    const query = supabase
      .from('t_user')
      .update<t_user>({
        usage_status: Number(req.usage_status),
        master_memo: req.memo,
        updated_at: timestamp,
      })
      .eq('id', req.id)
      .eq('user_registration_status', Number(UserRegistrationStatus.REGISTERED))
      .eq('usage_status', Number(UsageStatus.AVAILABLE))
      .select('id')
      .single();

    const { error, data } = (await query) as PostgrestSingleResponse<t_user>;

    if (error) {
      console.error(error);
      return { error: 'ユーザー情報の更新' + ERROR_MESSAGE.TEMPLATE };
    }

    return { data: Number(data.id) };
  } catch (error) {
    console.error(error);
    return { error: ERROR_MESSAGE.UNEXPECTED };
  }
};

/**
 * _disapprovalUserRegistrationStatus
 * IDに一致するユーザー情報を否認する。
 *
 * @param {ApiRequest<UserDetailFormValues>} values - 検索条件
 * @returns {Promise<UserDetailFormValues>} 検索結果
 */
export const _disapprovalUserRegistrationStatus = async (
  values: ApiRequest<UserDetailFormValues>
): Promise<ApiResponse<number>> => {
  const supabase = await createClient();

  const req = values.request;
  const timestamp = getNow();

  try {
    const query = supabase
      .from('t_user')
      .update<t_user>({
        usage_status: Number(UserRegistrationStatus.DISAPPROVAL),
        updated_at: timestamp,
      })
      .eq('id', req.id)
      .eq('user_registration_status', Number(UserRegistrationStatus.WAITING_APPROVAL))
      .eq('usage_status', Number(UsageStatus.DEACTIVATION))
      .select('id')
      .single();

    const { error, data } = (await query) as PostgrestSingleResponse<t_user>;

    if (error) {
      console.error(error);
      return { error: 'ユーザー情報の否認' + ERROR_MESSAGE.TEMPLATE };
    }

    return {
      data: Number(data.id),
    };
  } catch (error) {
    console.error(error);
    return { error: ERROR_MESSAGE.UNEXPECTED };
  }
};

/**
 * _disapprovalUserRegistrationStatus
 * IDに一致するユーザー情報を引き戻し(承認)する。
 *
 * @param {ApiRequest<UserDetailFormValues>} values - 検索条件
 * @returns {Promise<UserDetailFormValues>} 検索結果
 */
export const _pullBackUserRegistrationStatus = async (
  values: ApiRequest<UserDetailFormValues>
): Promise<ApiResponse<number>> => {
  const supabase = await createClient();

  const req = values.request;
  const timestamp = getNow();

  try {
    const query = supabase
      .from('t_user')
      .update<t_user>({
        usage_status: Number(UserRegistrationStatus.WAITING_EMAIL_VERIFICATION),
        updated_at: timestamp,
      })
      .eq('id', req.id)
      .eq('user_registration_status', Number(UserRegistrationStatus.WAITING_APPROVAL))
      .eq('usage_status', Number(UsageStatus.DEACTIVATION))
      .select('id')
      .single();

    const { error, data } = (await query) as PostgrestSingleResponse<t_user>;

    // サインアップ処理を記述する。

    if (error) {
      console.error(error);
      return { error: 'ユーザー情報の引き戻し承認' + ERROR_MESSAGE.TEMPLATE };
    }

    return {
      data: Number(data.id),
    };
  } catch (error) {
    console.error(error);
    return { error: ERROR_MESSAGE.UNEXPECTED };
  }
};

/**
 * _disapprovalUserRegistrationStatus
 * IDに一致する店舗情報を承認する。
 *
 * @param {ApiRequest<UserDetailFormValues>} values - 検索条件
 * @returns {Promise<UserDetailFormValues>} 検索結果
 */
export const _approvalUserRegistrationStatus = async (
  values: ApiRequest<UserDetailFormValues>
): Promise<ApiResponse<number>> => {
  const pgClient = createPgClient();
  const supabase = await createClient();

  const req = values.request;
  const timestamp = getNow();

  let res: ApiResponse<number> = {};

  try {
    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await pgClient.query('BEGIN');

    /* Update - t_user
  　------------------------------------------------------------------ */
    // UpdateData setting
    const updateValues: Pick<t_user, 'usage_status' | 'updated_at'> = {
      usage_status: Number(UserRegistrationStatus.WAITING_EMAIL_VERIFICATION),
      updated_at: timestamp,
    };
    const { columns, values } = getPostgreSqlItems(updateValues);
    const updateSql = `
      UPDATE t_user
        SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
        WHERE id = ${req.id}
        AND usage_state = ${UserRegistrationStatus.WAITING_APPROVAL} 
        RETURNING id, user_email;`;

    // Insert
    const result = await pgClient.query(updateSql, values);
    if (result.rowCount === 0) {
      throw new Error('ユーザー情報の承認' + ERROR_MESSAGE.TEMPLATE);
    }

    const updateId: number = result.rows[0]?.id;
    const email: string = result.rows[0]?.user_email;
    const password: string = result.rows[0]?.password;

    // TODO: パスワードの復号化を行う

    /* signUp
  　------------------------------------------------------------------ */
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: '',
    });

    if (signUpError) {
      console.error('Error signing up:', signUpError);
      throw new Error('ユーザー情報のサインアップ' + ERROR_MESSAGE.TEMPLATE);
    }

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, new company ID:', updateId);

    res = { data: updateId };
  } catch (error) {
    // Rollback
    await pgClient.query('ROLLBACK');
    console.error('Transaction failed:', error);

    res = { error: ERROR_MESSAGE.UNEXPECTED };
  } finally {
    // Transaction End
    await pgClient.end();
    return res;
  }
};
