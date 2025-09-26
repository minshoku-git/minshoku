import { parse } from 'querystring';

import { decrypt } from '@/app/_lib/encryption/crypto';
import { getNow } from '@/app/_lib/getDateTime';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_user } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getPostgreSqlItems } from '@/app/_lib/utill';
import { UsageStatus, UserApprovalType, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { UserDetailFormValues } from '@/app/(private)/user-detail/[id]/_lib/types';
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
    const decryptedQuery = decrypt(token);
    const queryObject = parse(decryptedQuery);

    const id = queryObject.id as string;
    const user_approval_type = queryObject.user_approval_type;

    if (!id || !user_approval_type) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '不正なリクエストです。' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    if (user_approval_type === UserApprovalType.APPROVAL) {
      // 承認
      await approvalUserRegistrationStatus(Number(id));
      return {
        success: true,
        data: { userApprovalType: UserApprovalType.APPROVAL },
      };
    } else if (user_approval_type === UserApprovalType.DISAPPROVAL) {
      await approvalUserRegistrationStatus(Number(id));
      return {
        success: true,
        data: { userApprovalType: UserApprovalType.DISAPPROVAL },
      };
    } else {
      // それ以外(不正)
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '不正なリクエストです。' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }
  } catch (e: unknown) {
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
  }
};

/**
 * _disapprovalUserRegistrationStatus
 * IDに一致する店舗情報を承認する。
 *
 * @param {number} id - ユーザーID
 * @returns {Promise<UserDetailFormValues>} 検索結果
 */
export const approvalUserRegistrationStatus = async (id: number): Promise<ApiResponse<number>> => {
  const pgClient = createPgClient();
  const supabase = await createClient(); //signUp用
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
        id = ${id};`;

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
        WHERE id = ${id}
        AND usage_status = ${UsageStatus.DEACTIVATION} 
        AND user_registration_status = ${UserRegistrationStatus.WAITING_APPROVAL} 
        RETURNING id;`;

    // Insert
    const result = await pgClient.query(updateSql, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ユーザー情報の承認' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    const updateId: number = result.rows[0]?.id;

    // TODO: パスワードの復号化を行う

    /* signUp
  　------------------------------------------------------------------ */
    // const { error: signUpError } = await supabase.auth.signUp({
    //   email,
    //   password,
    // });

    // if (signUpError) {
    //   console.error('Error signing up:', signUpError);
    //   throw new Error('ユーザー情報のサインアップ' + ERROR_MESSAGE.TEMPLATE);
    // }

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
