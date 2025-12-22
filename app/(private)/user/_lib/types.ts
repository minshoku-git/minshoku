import { z } from 'zod';

import { MSG_MAX } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { PaginateData } from '@/app/_types/types';

/**
 * ユーザー一覧 検索条件 FormValues
 */
export const UserSearchSchema = z
  .object({
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
    /** 利用ステータス */
    usage_status: z.enum(UsageStatus).or(z.literal('')).optional(),
    /** ユーザー登録ステータス */
    user_registration_status: z.enum(UserRegistrationStatus).or(z.literal('')).optional(),
  })
  .strict();

/**
 * ユーザー一覧 検索条件 FormValues
 */
export type UserSearchFormValues = z.infer<typeof UserSearchSchema>;

/** 検索結果 ユーザー一覧 */
export type UserListSearchResult = {
  /** ユーザー情報リスト */
  userDatas: UserData[];
  /** ページネート */
  paginate?: PaginateData;
};

export type UserData = {
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
  /** ユーザー登録ステータス */
  user_registration_status: string | UserRegistrationStatus;
  /** 利用ステータス */
  usage_status?: string | UsageStatus;
};
