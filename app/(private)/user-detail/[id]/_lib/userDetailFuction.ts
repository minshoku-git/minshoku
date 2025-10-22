import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { decrypt, encrypt } from '@/app/_lib/encryption/crypto';
import { getNow } from '@/app/_lib/getDateTime';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_user } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getPostgreSqlItems } from '@/app/_lib/utill';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SignUpEncrypt } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { UpdateUserData, UserDataDetailRequest, UserDataDetailResult, UserDetailFormValues } from './types';

/* ユーザー詳細
------------------------------------------------------------------ */

/**
 * get_userDetail
 * IDに一致するユーザー情報を取得する。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<UserDetailFormValues>} 検索結果
 */
export const searchUserDetail = async (values: ApiRequest<number>): Promise<ApiResponse<UserDataDetailResult>> => {
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
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ユーザー情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
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
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};

/**
 * _updateUserRegistrationStatus
 * IDに一致するユーザー情報を更新する。
 *
 * @param {ApiRequest<UserDataDetailRequest>} values - 検索条件
 * @returns {Promise<ApiResponse<number>>} 検索結果
 */
export const updateUserDetail = async (values: ApiRequest<UserDataDetailRequest>): Promise<ApiResponse<number>> => {
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
        ErrorCodes.NOT_FOUND.code,
        'ユーザー情報の更新' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    return { success: true, data: Number(data.id) };
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};

/**
 * _disapprovalUserRegistrationStatus
 * IDに一致するユーザー情報を否認する。
 *
 * @param {ApiRequest<UpdateUserData>} values - 検索条件
 * @returns {Promise<UserDetailFormValues>} 検索結果
 */
export const disapprovalUserRegistrationStatus = async (
  values: ApiRequest<UpdateUserData>
): Promise<ApiResponse<number>> => {
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
        ErrorCodes.NOT_FOUND.code,
        'ユーザー情報の否認' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    return { success: true, data: Number(data.id) };
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};

/**
 * _disapprovalUserRegistrationStatus
 * IDに一致するユーザー情報を引き戻し(承認)する。
 *
 * @param {ApiRequest<UserDataDetailRequest>} values - 検索条件
 * @returns {Promise<null>} 検索結果
 */
export const pullBackUserRegistrationStatus = async (
  values: ApiRequest<UserDataDetailRequest>
): Promise<ApiResponse<null>> => {
  const pgClient = createPgClient();
  const supabase = await createClient(); //signUp用
  const req = values.request;
  const timestamp = getNow();

  try {
    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

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
        ErrorCodes.NOT_FOUND.code,
        'ユーザー情報の引き戻し承認' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
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
        ErrorCodes.NOT_FOUND.code,
        '認証メール送信' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

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
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  } finally {
    // Transaction End
    await pgClient.end();
  }
};

/**
 * _disapprovalUserRegistrationStatus
 * IDに一致するユーザー情報を承認する。
 *
 * @param {ApiRequest<UserDataDetailRequest>} values - 検索条件
 * @returns {Promise<UserDetailFormValues>} 検索結果
 */
export const approvalUserRegistrationStatus = async (
  values: ApiRequest<UserDataDetailRequest>
): Promise<ApiResponse<number>> => {
  const pgClient = createPgClient();
  const supabase = await createClient(); //signUp用
  const req = values.request;
  const timestamp = getNow();

  try {
    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

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
        ErrorCodes.NOT_FOUND.code,
        'ユーザー情報の承認' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
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
        ErrorCodes.NOT_FOUND.code,
        '認証メール送信' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, new company ID:', updateId);

    return { success: true, data: updateId };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    // Rollback
    await rollbackWithLog(pgClient);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  } finally {
    // Transaction End
    await pgClient.end();
  }
};
