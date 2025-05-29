import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_MAX } from '@/app/_types/constants';
import { UsageStatus, UserUsageStatus } from '@/app/_types/enum';

/**
 * ユーザー詳細 検索条件 Schema
 */
export const UserDetailSchema = z.object({
  /** ステータス */
  usage_status: z.nativeEnum(UsageStatus),
  /** メモ */
  memo: z
    .string()
    .max(500, formatString(MSG_MAX, 'メモ', '500'))
    .optional(),
});

/**
 * ユーザー詳細 検索条件 FormValues
 */
export type UserDetailFormValues = z.infer<typeof UserDetailSchema>;

/** 取得結果 ユーザー詳細 */
export type DetailResult_UserData = {
  /** ID */
  id: string;
  /** ユーザー名 */
  user_name: string;
  /** ユーザー名カナ */
  user_name_kana: string;
  /** 任意項目_回答1 */
  optional_item_answer_1?: string;
  /** 任意項目_回答2 */
  optional_item_answer_2?: string;
  /** メールアドレス */
  user_email?: string;
  /** ユーザー利用ステータス */
  user_usage_status: string | UserUsageStatus;
  /** 利用ステータス */
  usage_status: string | UsageStatus;
  /** メモ（マスタ） */
  master_memo?: string;
  /** 会社情報 */
  t_companies: {
    /** 会社名 */
    company_name: string;
    /** 支店名 */
    branch_name: string;
  };
  /** 部署情報 */
  t_companies_department: {
    /** 部署名 */
    department_name?: string;
  };
  /** 会社雇用形態情報 */
  t_companies_employment_status: {
    /** 雇用形態名 */
    employment_status_name?: string;
  };
};
