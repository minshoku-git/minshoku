import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { decrypt, encrypt } from '@/app/_lib/encryption/crypto';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_user } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow } from '@/app/_lib/utils/getDateTime';
import { getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SignUpEncrypt } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import {
  UpdateUserData,
  UserDataDetailRequest,
  UserDataDetailResult,
  UserDetailFormValues,
  UserDetailInitValues,
} from './types';

/* ユーザー詳細
------------------------------------------------------------------ */

/**
 * get_userDetail
 * IDに一致するユーザー情報を取得する。
 *
 * @param {ApiRequest<UserDetailInitValues>} values - 検索条件
 * @returns {Promise<ApiResponse<UserDataDetailResult>>} 検索結果
 */
export const searchUserDetail = async (
  values: ApiRequest<UserDetailInitValues>
): Promise<ApiResponse<UserDataDetailResult>> => {
  const supabase = await createClient();
  const id: number = values.request.id;

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
      .eq('id', id)
      .single();

    const { data, error } = (await query) as PostgrestSingleResponse<UserDataDetailResult>;

    if (error) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    return {
      success: true,
      data: {
        ...data,
        usage_status: data.usage_status,
        user_registration_status: data.user_registration_status,
      },
    };
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
 * _updateUserRegistrationStatus
 * IDに一致するユーザー情報を更新する。
 *
 * @param {ApiRequest<UserDataDetailRequest>} values - 検索条件
 * @returns {Promise<ApiResponse<null>>} 検索結果
 */
export const updateUserDetail = async (values: ApiRequest<UserDataDetailRequest>): Promise<ApiResponse<null>> => {
  const supabase = await createClient();
  const req = values.request;
  const timestamp = getNow();

  console.log(req);

  try {
    const query = supabase
      .from('t_user')
      .update<t_user>({
        usage_status: req.usage_status,
        master_memo: req.memo,
        updated_at: timestamp,
      })
      .eq('id', req.id)
      .eq('user_registration_status', Number(UserRegistrationStatus.REGISTERED))
      .select('id')
      .single();

    const { error, data } = (await query) as PostgrestSingleResponse<t_user>;

    if (error) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の更新' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    console.log('update userId:' + data.id);
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
 * _disapprovalUserRegistrationStatus
 * IDに一致するユーザー情報を否認する。
 *
 * @param {ApiRequest<UpdateUserData>} values - 検索条件
 * @returns {Promise<ApiResponse<null>>} 検索結果
 */
export const disapprovalUserRegistrationStatus = async (
  values: ApiRequest<UpdateUserData>
): Promise<ApiResponse<null>> => {
  const supabase = await createClient();

  const id = values.request.id;
  const timestamp = getNow();

  try {
    const query = supabase
      .from('t_user')
      .update<t_user>({
        user_registration_status: UserRegistrationStatus.DISAPPROVAL,
        updated_at: timestamp,
      })
      .eq('id', id)
      .eq('user_registration_status', Number(UserRegistrationStatus.WAITING_APPROVAL))
      .eq('usage_status', Number(UsageStatus.DEACTIVATION))
      .select('id')
      .single();

    const { error, data } = (await query) as PostgrestSingleResponse<t_user>;

    if (error) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の否認' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    console.log('update userId:' + data.id);
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
 * _pullBackUserRegistrationStatus
 * IDに一致するユーザー情報を引き戻し(承認)する。
 *
 * @param {ApiRequest<UserDataDetailRequest>} values - 検索条件
 * @returns {Promise<ApiResponse<null>>} 検索結果
 */
export const pullBackUserRegistrationStatus = async (
  values: ApiRequest<UpdateUserData> 
): Promise<ApiResponse<null>> => {
  const req = values.request;
  const timestamp = getNow();
  const supabase = await createClient(); //signUp用

  // connection Start
  const pgClient = await createPgClient();

  try {
    // Transaction Start
    await pgClient.query('BEGIN');

    /* Select - t_user
  　------------------------------------------------------------------ */
    const selectSql = `
      SELECT
        user_email,
        signup_password
      From
        t_user
      Where
        id = ${req.id};`;

    // Insert
    const emailAndPassword = await pgClient.query(selectSql);
    const email: string = emailAndPassword.rows[0]?.user_email;
    const password: string = emailAndPassword.rows[0]?.signup_password;

    /* Update - t_user
  　------------------------------------------------------------------ */
    const updateValues: Pick<t_user, 'user_registration_status' | 'signup_password' | 'updated_at'> = {
      user_registration_status: UserRegistrationStatus.WAITING_EMAIL_VERIFICATION,
      updated_at: timestamp,
    };
    const { columns, values } = getPostgreSqlItems(updateValues);
    const updateSql = `
      UPDATE t_user
        SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
        WHERE id = ${req.id}
        AND usage_status = ${UsageStatus.DEACTIVATION} 
        AND user_registration_status = ${UserRegistrationStatus.DISAPPROVAL}`;

    const result = await pgClient.query(updateSql, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の引き戻し承認' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    const updateId: number = result.rows[0]?.id;

    /* 復号化
    ------------------------------------------------------------------ */
    const decryptPassword: string = decrypt(password);

    /* 暗号化
    ------------------------------------------------------------------ */
    const signUpEncrypt: SignUpEncrypt = { id: updateId };
    const signUpEncryptReq: string = encrypt(JSON.stringify(signUpEncrypt));

    /* signUp
  　------------------------------------------------------------------ */
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: decryptPassword,
      options: { emailRedirectTo: process.env.APP_URL_DEV + '/pre-registration/' + signUpEncryptReq },
    });

    if (signUpError) {
      console.error('Error signing up:', signUpError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '認証メール送信' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* --------------------------------------------------------------- */
    // Commit
    await pgClient.query('COMMIT');

    return { success: true, data: null };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    // Rollback
    await rollbackWithLog(pgClient);

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
  } finally {
    // Transaction End
    await pgClient.end();
  }
};

/**
 * _approvalUserRegistrationStatus
 * IDに一致するユーザー情報を承認する。
 *
 * @param {ApiRequest<UserDataDetailRequest>} values - 検索条件
 * @returns {Promise<ApiResponse<null>> } 検索結果
 */
export const approvalUserRegistrationStatus = async (
  values: ApiRequest<UpdateUserData>
): Promise<ApiResponse<null>> => {
  const req = values.request;
  const timestamp = getNow();
  const supabase = await createClient(); //signUp用

  // connection Start
  const pgClient = await createPgClient();

  try {
    // Transaction Start
    await pgClient.query('BEGIN');

    /* Select - t_user
  　------------------------------------------------------------------ */
    const selectSql = `
      SELECT
        user_email,
        signup_password
      From
        t_user
      Where
        id = ${req.id};`;

    // Insert
    const emailAndPassword = await pgClient.query(selectSql);
    const email: string = emailAndPassword.rows[0]?.user_email;
    const password: string = emailAndPassword.rows[0]?.signup_password;

    /* Update - t_user
  　------------------------------------------------------------------ */
    // UpdateData setting
    const updateValues: Pick<t_user, 'user_registration_status' | 'signup_password' | 'updated_at'> = {
      user_registration_status: UserRegistrationStatus.WAITING_EMAIL_VERIFICATION,
      signup_password: '',
      updated_at: timestamp,
    };
    const { columns, values } = getPostgreSqlItems(updateValues);
    const updateSql = `
      UPDATE t_user
        SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
        WHERE id = ${req.id}
        AND usage_status = ${UsageStatus.DEACTIVATION} 
        AND user_registration_status = ${UserRegistrationStatus.WAITING_APPROVAL} 
        RETURNING id;`;

    const result = await pgClient.query(updateSql, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の承認' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    const updateId: number = result.rows[0]?.id;

    /* 復号化
    ------------------------------------------------------------------ */
    const decryptPassword: string = decrypt(password);

    /* 暗号化
    ------------------------------------------------------------------ */
    const signUpEncrypt: SignUpEncrypt = { id: updateId };
    const signUpEncryptReq: string = encrypt(JSON.stringify(signUpEncrypt));

    /* signUp
  　------------------------------------------------------------------ */
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: decryptPassword,
      options: { emailRedirectTo: process.env.APP_URL_DEV + '/pre-registration/' + signUpEncryptReq },
    });

    if (signUpError) {
      console.error('Error signing up:', signUpError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '認証メール送信' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* --------------------------------------------------------------- */
    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, new company ID:', updateId);

    return { success: true, data: null };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    // Rollback
    await rollbackWithLog(pgClient);

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
  } finally {
    // Transaction End
    await pgClient.end();
  }
};
