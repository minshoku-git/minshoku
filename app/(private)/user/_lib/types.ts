import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_MAX } from '@/app/_types/constants';
import { UserUsageStatus } from '@/app/_types/enum';

/**
 * ユーザー一覧 検索条件 FormValues
 */
export const UserSearchSchema = z.object({
  /** ユーザー名 */
  user_name: z.string().optional(),
  /** 会社名 */
  company_name: z
    .string()
    .max(64, formatString(MSG_MAX, '会社名', '64'))
    .optional(),
  /** 支店名 */
  branch_name: z
    .string()
    .max(64, formatString(MSG_MAX, '支店名', '64'))
    .optional(),
  /** ユーザー利用ステータス */
  user_usage_status: z.union([z.string().optional(), z.nativeEnum(UserUsageStatus)]),
});

/**
 * ユーザー一覧 検索条件 FormValues
 */
export type UserSearchFormValues = z.infer<typeof UserSearchSchema>;

/** 検索結果 ユーザー一覧 */
export type UserListSearchResult = {
  /** ID */
  id: string;
  /** ユーザー名 */
  user_name: string;
  /** ユーザー名カナ */
  user_name_kana: string;
  /** 会社ID */
  t_companies_id: string;
  /** 会社情報 */
  t_companies: {
    /** 会社名 */
    company_name: string;
    /** 支店名 */
    branch_name: string;
  };
  /** ユーザー利用ステータス */
  user_usage_status: string | UserUsageStatus;
};
