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
 * pullBackUserRegistrationStatus
 * IDに一致するユーザー情報を引き戻し(承認)する。
 *
 * @param {ApiRequest<UpdateUserData>} values - 検索条件
 * @returns {Promise<ApiResponse<null>>} 検索結果
 */
export const pullBackUserRegistrationStatus = async (
  values: ApiRequest<UpdateUserData>
): Promise<ApiResponse<null>> => {
  const req = values.request;
  const timestamp = getNow();
  console.log('[pullBackUserRegistrationStatus] Start. req:', req);

  // connection Start
  const pgClient = await createPgClient();

  try {
    const supabase = await createClient(); // signUp用
    
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
        id = $1;`;

    const emailAndPassword = await pgClient.query(selectSql, [req.id]);
    
    // 【修正箇所】ErrorCodes.NOT_FOUND を使わずに直接コードを指定
    if (emailAndPassword.rowCount === 0) {
      throw new CustomError('E404-01', '対象のユーザー情報が見つかりません。', 404);
    }

    const email: string = emailAndPassword.rows[0]?.user_email;
    const password = emailAndPassword.rows[0]?.signup_password;

    console.log('[pullBackUserRegistrationStatus] Found user:', { email, hasPassword: !!password });

    // バリデーションガード
    if (!email) {
      throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, 'メールアドレスが登録されていません。', 400);
    }
    if (!password) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '一時パスワード(signup_password)がありません。すでに登録が完了している可能性があります。',
        400
      );
    }

    /* 復号化
    ------------------------------------------------------------------ */
    let decryptPassword = '';
    try {
      decryptPassword = decrypt(password);
    } catch (decryptErr) {
      console.error('[pullBackUserRegistrationStatus] Decryption failed:', decryptErr);
      throw new CustomError(
        ErrorCodes.INTERNAL_SERVER_ERROR.code,
        'パスワードの復号化に失敗しました。暗号鍵の設定、またはDBの暗号化データを確認してください。',
        500
      );
    }

    /* Update - t_user
  　------------------------------------------------------------------ */
    const updateValues: Pick<t_user, 'user_registration_status' | 'updated_at'> = {
      user_registration_status: UserRegistrationStatus.WAITING_EMAIL_VERIFICATION,
      updated_at: timestamp,
    };
    
    const { columns, values: dbValues } = getPostgreSqlItems(updateValues);
    
    const updateSql = `
      UPDATE t_user
        SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
        WHERE id = $${columns.length + 1}
        AND usage_status = $${columns.length + 2} 
        AND user_registration_status = $${columns.length + 3}
        RETURNING id;`;

    const result = await pgClient.query(updateSql, [
      ...dbValues,
      req.id,
      Number(UsageStatus.DEACTIVATION),
      Number(UserRegistrationStatus.DISAPPROVAL)
    ]);

    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の引き戻し承認に失敗しました(対象レコードの状態が不適切です)。',
        400
      );
    }

    const updateId: number = result.rows[0]?.id;

    /* 暗号化
    ------------------------------------------------------------------ */
    let signUpEncryptReq = '';
    try {
      const signUpEncrypt: SignUpEncrypt = { id: updateId };
      signUpEncryptReq = encrypt(JSON.stringify(signUpEncrypt));
    } catch (encryptErr) {
      console.error('[pullBackUserRegistrationStatus] Encryption failed:', encryptErr);
      throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR.code, 'リダイレクトURL用トークンの暗号化に失敗しました。', 500);
    }

    /* signUp
  　------------------------------------------------------------------ */
    const redirectUrl = (process.env.APP_URL_DEV || '') + '/pre-registration/' + signUpEncryptReq;
    console.log('[pullBackUserRegistrationStatus] Supabase SignUp Executed. RedirectURL:', redirectUrl);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: decryptPassword,
      options: { emailRedirectTo: redirectUrl },
    });

    if (signUpError) {
      console.error('[pullBackUserRegistrationStatus] Supabase Auth Error:', signUpError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        `Supabase認証エラー: ${signUpError.message}`,
        signUpError.status || 500
      );
    }

    /* --------------------------------------------------------------- */
    // Commit
    await pgClient.query('COMMIT');
    console.log('[pullBackUserRegistrationStatus] Transaction success. ID:', updateId);

    return { success: true, data: null };
  } catch (e: unknown) {
    console.error('[pullBackUserRegistrationStatus] Transaction failed:', e);
    // Rollback
    await rollbackWithLog(pgClient);

    if (e instanceof CustomError) {
      return { success: false, error: e };
    }
    
    // システムの生のスタックトレースメッセージを引き出して返す
    const errorDetails = e instanceof Error ? e.message : 'Unknown error';
    return {
      success: false,
      error: new CustomError(
        ErrorCodes.INTERNAL_SERVER_ERROR.code,
        `内部エラー: ${errorDetails}`,
        500
      )
    };
  } finally {
    // Transaction End
    await pgClient.end();
  }
};

/**
 * approvalUserRegistrationStatus
 * IDに一致するユーザー情報を承認する。
 *
 * @param {ApiRequest<UpdateUserData>} values - 検索条件
 * @returns {Promise<ApiResponse<null>> } 検索結果
 */
export const approvalUserRegistrationStatus = async (
  values: ApiRequest<UpdateUserData>
): Promise<ApiResponse<null>> => {
  const req = values.request;
  const timestamp = getNow();
  console.log('[approvalUserRegistrationStatus] Start. req:', req);

  // connection Start
  const pgClient = await createPgClient();

  try {
    const supabase = await createClient(); // signUp用
    
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
        id = $1;`;

    const emailAndPassword = await pgClient.query(selectSql, [req.id]);
    
    // 【修正箇所】ErrorCodes.NOT_FOUND を使わずに直接コードを指定
    if (emailAndPassword.rowCount === 0) {
      throw new CustomError('E404-01', '対象のユーザー情報が見つかりません。', 404);
    }

    const email: string = emailAndPassword.rows[0]?.user_email;
    const password = emailAndPassword.rows[0]?.signup_password;

    console.log('[approvalUserRegistrationStatus] Found user:', { email, hasPassword: !!password });

    // バリデーションガード
    if (!email) {
      throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, 'メールアドレスが登録されていません。', 400);
    }
    if (!password) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '一時パスワード(signup_password)がありません。すでに登録が完了している可能性があります。',
        400
      );
    }

    /* 復号化
    ------------------------------------------------------------------ */
    let decryptPassword = '';
    try {
      decryptPassword = decrypt(password);
    } catch (decryptErr) {
      console.error('[approvalUserRegistrationStatus] Decryption failed:', decryptErr);
      throw new CustomError(
        ErrorCodes.INTERNAL_SERVER_ERROR.code,
        'パスワードの復号化に失敗しました。暗号鍵の設定、またはDBの一時パスワードデータを確認してください。',
        500
      );
    }

    /* Update - t_user
  　------------------------------------------------------------------ */
    const updateValues: Pick<t_user, 'user_registration_status' | 'updated_at'> = {
      user_registration_status: UserRegistrationStatus.WAITING_EMAIL_VERIFICATION,
      updated_at: timestamp,
    };
    
    const { columns, values: dbValues } = getPostgreSqlItems(updateValues);
    
    const updateSql = `
      UPDATE t_user
        SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
        WHERE id = $${columns.length + 1}
        AND usage_status = $${columns.length + 2} 
        AND user_registration_status = $${columns.length + 3} 
        RETURNING id;`;

    const result = await pgClient.query(updateSql, [
      ...dbValues,
      req.id,
      Number(UsageStatus.DEACTIVATION),
      Number(UserRegistrationStatus.WAITING_APPROVAL)
    ]);

    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の承認に失敗しました(対象レコードの状態が不適切です)。',
        400
      );
    }

    const updateId: number = result.rows[0]?.id;

    /* 暗号化
    ------------------------------------------------------------------ */
    let signUpEncryptReq = '';
    try {
      const signUpEncrypt: SignUpEncrypt = { id: updateId };
      signUpEncryptReq = encrypt(JSON.stringify(signUpEncrypt));
    } catch (encryptErr) {
      console.error('[approvalUserRegistrationStatus] Encryption failed:', encryptErr);
      throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR.code, 'リダイレクトURL用トークンの暗号化に失敗しました。', 500);
    }

    /* signUp
  　------------------------------------------------------------------ */
    const redirectUrl = (process.env.APP_URL_DEV || '') + '/pre-registration/' + signUpEncryptReq;
    console.log('[approvalUserRegistrationStatus] Supabase SignUp Executed. RedirectURL:', redirectUrl);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: decryptPassword,
      options: { emailRedirectTo: redirectUrl },
    });

    if (signUpError) {
      console.error('[approvalUserRegistrationStatus] Supabase Auth Error:', signUpError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        `Supabase認証エラー: ${signUpError.message}`,
        signUpError.status || 500
      );
    }

    /* --------------------------------------------------------------- */
    // Commit
    await pgClient.query('COMMIT');
    console.log('[approvalUserRegistrationStatus] Transaction success. ID:', updateId);

    return { success: true, data: null };
  } catch (e: unknown) {
    console.error('[approvalUserRegistrationStatus] Transaction failed:', e);
    // Rollback
    await rollbackWithLog(pgClient);

    if (e instanceof CustomError) {
      return { success: false, error: e };
    }

    // システムの生のスタックトレースメッセージを引き出して返す
    const errorDetails = e instanceof Error ? e.message : 'Unknown error';
    return {
      success: false,
      error: new CustomError(
        ErrorCodes.INTERNAL_SERVER_ERROR.code,
        `内部エラー: ${errorDetails}`,
        500
      )
    };
  } finally {
    // Transaction End
    await pgClient.end();
  }
};