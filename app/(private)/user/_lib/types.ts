import { z } from 'zod';

import { MSG_MAX } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { SortItemsSchema } from '@/app/_types/schema';
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
 * ユーザー一覧 API用バリデーションスキーマ
 */
export const UserSearchApiSchema = z
  .object({
    request: UserSearchSchema,
    sortItems: SortItemsSchema,
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

/** CSV出力用 DB取得結果 */
export type UserCsvDbRow = {
  id: number;
  user_name: string;
  user_name_kana: string;
  user_email?: string;
  user_registration_status: string;
  usage_status?: string;
  master_memo?: string;
  optional_item_answer_1?: string;
  optional_item_answer_2?: string;
  t_companies: {
    company_name: string;
    branch_name: string;
    optional_item_title_1?: string;
    optional_item_title_2?: string;
  };
  t_companies_department: { department_name?: string } | null;
  t_companies_employment_status: { employment_status_name?: string } | null;
};

/**
 * CSV出力データ（1行分）
 * キーがそのままCSVの見出しになる。並びはユーザー詳細画面(/user-detail)の表示順に合わせる。
 */
export type UserCsvData = {
  ユーザーID: string;
  ユーザー名: string;
  'ユーザー名(カナ)': string;
  メールアドレス: string;
  会社名: string;
  支店名: string;
  部署名: string;
  雇用形態名: string;
  任意項目1_項目名: string;
  任意項目1_回答: string;
  任意項目2_項目名: string;
  任意項目2_回答: string;
  登録ステータス: string;
  メモ: string;
  利用ステータス: string;
};
