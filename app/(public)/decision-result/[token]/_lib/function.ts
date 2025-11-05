import { decrypt, encrypt } from '@/app/_lib/encryption/crypto';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_user } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow } from '@/app/_lib/utils/getDateTime';
import { getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { UsageStatus, UserApprovalType, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SignUpEncrypt } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { DecisionData, DecisionResult } from './types';

/**
 * tokenを復号化して承認または否認を実行する。
 *
 * @param {ApiRequest<DecisionData>} values - 暗号情報
 * @returns {Promise<ApiResponse<DecisionResult>>} 処理結果
 */
export const decision = async (values: ApiRequest<DecisionData>): Promise<ApiResponse<DecisionResult>> => {
  try {
    // 復号化
    const token = values.request.token;
    const userApprovalType = values.request.userApprovalType;
    const decryptedQuery = decrypt(token);
    const queryObject = JSON.parse(decryptedQuery);

    const userId = queryObject.id as string;

    if (!userId || !userApprovalType) {
      throw new CustomError(ErrorCodes.INVALID_RECOVERY_LINK);
    }

    if (userApprovalType === UserApprovalType.APPROVAL) {
      // 承認
      return await approvalUserRegistrationStatus(Number(userId));
    } else if (userApprovalType === UserApprovalType.DISAPPROVAL) {
      // 否認
      return await approvalUserRegistrationStatus(Number(userId));
    } else {
      // 無効なリンク
      throw new CustomError(ErrorCodes.INVALID_RECOVERY_LINK);
    }
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

/**
 * _disapprovalUserRegistrationStatus
 * IDに一致するユーザー情報を承認する。
 *
 * @param {number} id - ユーザーID
 * @returns {Promise<ApiResponse<DecisionResult>>} 検索結果
 */
export const approvalUserRegistrationStatus = async (id: number): Promise<ApiResponse<DecisionResult>> => {
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
        signup_password,
        user_registration_status
      From
        t_user
      Where
        id = ${id};`;

    const emailAndPassword = await pgClient.query(selectSql);
    const email: string = emailAndPassword.rows[0]?.user_email;
    const password: string = emailAndPassword.rows[0]?.signup_password;
    const userRegistrationStatus: string = emailAndPassword.rows[0]?.user_registration_status;

    if (userRegistrationStatus !== UserRegistrationStatus.WAITING_APPROVAL) {
      return { success: true, data: { userApprovalType: UserApprovalType.PROCESSED } };
    }

    /* Update - t_user
  　------------------------------------------------------------------ */
    // UpdateData setting
    const updateValues: Pick<t_user, 'user_registration_status' | 'updated_at'> = {
      user_registration_status: UserRegistrationStatus.WAITING_EMAIL_VERIFICATION.toString(),
      updated_at: timestamp,
    };
    const { columns, values } = getPostgreSqlItems(updateValues);
    const updateSql = `
      UPDATE t_user
        SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
        WHERE id = ${Number(id)}
        AND usage_status = '${UsageStatus.DEACTIVATION}'
        AND user_registration_status = '${UserRegistrationStatus.WAITING_APPROVAL}'
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

    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, new company ID:', updateId);

    return { success: true, data: { userApprovalType: UserApprovalType.APPROVAL } };
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
 * _disapprovalUserRegistrationStatus
 * IDに一致する店舗情報を否認する。
 *
 * @param {number} id - ユーザーID
 * @returns {Promise<ApiResponse<DecisionResult>>} 検索結果
 */
export const disapprovalUserRegistrationStatus = async (id: number): Promise<ApiResponse<DecisionResult>> => {
  const timestamp = getNow();

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
        user_registration_status
      From
        t_user
      Where
        id = ${id};`;

    const checkStatus = await pgClient.query(selectSql);
    const userRegistrationStatus: string = checkStatus.rows[0]?.user_registration_status;

    if (userRegistrationStatus !== UserRegistrationStatus.WAITING_APPROVAL) {
      return { success: true, data: { userApprovalType: UserApprovalType.PROCESSED } };
    }

    /* Update - t_user
  　------------------------------------------------------------------ */
    // UpdateData setting
    const updateValues: Pick<t_user, 'user_registration_status' | 'updated_at'> = {
      user_registration_status: UserRegistrationStatus.WAITING_EMAIL_VERIFICATION.toString(),
      updated_at: timestamp,
    };
    const { columns, values } = getPostgreSqlItems(updateValues);
    const updateSql = `
      UPDATE t_user
        SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
        WHERE id = ${Number(id)}
        AND usage_status = '${UsageStatus.DEACTIVATION}'
        AND user_registration_status = '${UserRegistrationStatus.DISAPPROVAL}'
        RETURNING id;`;

    const result = await pgClient.query(updateSql, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ユーザー情報の否認' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    const updateId: number = result.rows[0]?.id;

    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, new company ID:', updateId);

    return { success: true, data: { userApprovalType: UserApprovalType.DISAPPROVAL } };
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
