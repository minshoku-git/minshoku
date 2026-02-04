import { z } from 'zod';

import { UsageStatus } from '@/app/_types/enum';

/**
 * 初期表示 入力用バリデーションスキーマ
 */
export const UserDetailInitSchema = z.object({
  id: z.number(),
});
/**
 * 初期表示 API用バリデーションスキーマ
 */
export const UserDetailInitApiSchema = z
  .object({
    request: UserDetailInitSchema,
  })
  .strict();
// 初期表示 FormValues
export type UserDetailInitValues = z.infer<typeof UserDetailInitSchema>;

/**
 * ユーザー詳細 入力項目 Schema
 */
export const UserDetailSchema = z
  .object({
    /** ステータス */
    usage_status: z.nativeEnum(UsageStatus),
    /** メモ */
    memo: z.string().optional(),
  })
  .strict();

/**
 * 会社新規登録・会社更新 API用バリデーションスキーマ
 */
export const UserDetailApiSchema = z
  .object({
    request: z.object({
      ...UserDetailInitSchema.shape,
      ...UserDetailSchema.shape,
    }),
  })
  .strict();

/**
 * 会社新規登録・会社更新 API用バリデーションスキーマ
 */
export const UserDetailDisapprovalApiSchema = z
  .object({
    request: UserDetailInitSchema,
  })
  .strict();

/** ユーザーID情報 */
export type UpdateUserData = z.infer<typeof UserDetailDisapprovalApiSchema>['request'];

/**
 * ユーザー詳細 入力項目 FormValues
 */
export type UserDetailFormValues = z.infer<typeof UserDetailSchema>;

/** ユーザー詳細 リクエスト */
export type UserDataDetailRequest = z.infer<typeof UserDetailApiSchema>['request'];

/** 取得結果 ユーザー詳細 */
export type UserDataDetailResult = {
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
  /** ユーザー登録ステータス */
  user_registration_status: string;
  /** 利用ステータス */
  usage_status: string;
  /** メモ（マスタ） */
  master_memo?: string;
  /** 会社情報 */
  t_companies: {
    /** 会社名 */
    company_name: string;
    /** 支店名 */
    branch_name: string;
    /** 任意項目_項目名1 */
    optional_item_title_1?: string;
    /** 任意項目_注釈1 */
    optional_item_notes_1?: string;
    /** 任意項目_項目名2 */
    optional_item_title_2?: string;
    /** 任意項目_注釈2 */
    optional_item_notes_2?: string;
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
