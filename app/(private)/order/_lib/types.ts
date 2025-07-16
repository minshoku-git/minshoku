import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_INVALID, MSG_MAX, MSG_REQUIRED } from '@/app/_types/constants';
import { OrderStatus } from '@/app/_types/enum';

/**
 * オーダー一覧 検索条件 Schema
 */
export const OrderSearchSchema = z
  .object({
    /** 配達日(FROM) */
    deliveryFrom: z.union([
      z.null({ message: formatString(MSG_INVALID, '配達日(FROM)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(MSG_INVALID, '配達日(FROM)')
              : formatString(MSG_REQUIRED, '配達日(FROM)'),
        }),
      }),
    ]),
    /** 配達日(TO) */
    deliveryTo: z.union([
      z.null({ message: formatString(MSG_INVALID, '配達日(TO)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(MSG_INVALID, '配達日(TO)')
              : formatString(MSG_REQUIRED, '配達日(TO)'),
        }),
      }),
    ]),
    /** ユーザー名 */
    user_name: z.string().optional(),
    /** 会社名 */
    company_name: z
      .string()
      .max(64, formatString(MSG_MAX, '会社名', '64'))
      .optional(),
    /** 注文ステータス */
    order_status: z.union([z.string().optional(), z.nativeEnum(OrderStatus)]),
  })
  /** 提供時間 FROM<TOではない */
  .superRefine((data, ctx) => {
    if (!data.deliveryFrom && !data.deliveryTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryFrom'],
        message: 'いずれかの日を入力してください。',
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryTo'],
        message: 'いずれかの日を入力してください。',
      });
    }
    if (data.deliveryFrom && data.deliveryTo) {
      if (data.deliveryFrom > data.deliveryTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['deliveryFrom'],
          message: '開始時間は終了時間より早い時間を設定してください。',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['deliveryTo'],
          message: '終了時間は開始時間より遅い時間を設定してください。',
        });
      }
    }
  });

/**
 * オーダー一覧 検索条件 FormValues
 */
export type OrderSearchFormValues = z.infer<typeof OrderSearchSchema>;

/** 検索結果 オーダー一覧 */
export type OrderListSearchResult = {
  /** ID */
  id: string;
  /** 納品日 */
  delivery_day: string;
  /** ユーザー名カナ */
  user_name_kana: string;
  /** 会社名 */
  company_name: string;
  /** 支店名 */
  branch_name: string;
  /** 個数 */
  count: number;
  /** 支払いステータス */
  payment_state: string;
  /** 注文ステータス */
  order_status: number;
};

/** 取得結果 オーダー詳細 */
export type orderDeteilResponseData = {
  /** id */
  id?: string;
  /** 納品日 */
  delivery_day?: string | Date;
  /** 個数 */
  count?: number;
  /** 単価 */
  unit_price?: number;
  /** 総額 */
  amount?: number;
  /** 支払い種別 */
  payment_type?: number;
  /** オーダーステータス */
  order_status?: number;
  /** 注文日時 */
  order_datetime?: string | Date;
  /** スケジュール */
  t_menu_schedule: {
    /** メニュー名 */
    menu_name?: string;
  };
  /** 店舗テーブル */
  t_shops: {
    /** 店舗名 */
    shop_name?: string;
  };
  /** ユーザーテーブル */
  t_user: {
    /** ユーザー名 */
    user_name?: string;
    /** ユーザー名カナ */
    user_name_kana?: string;
    /** メールアドレス */
    user_email?: string;
  };
  /** 会社テーブル */
  t_companies: {
    /** 会社名 */
    company_name?: string;
    /** 支店名 */
    branch_name?: string;
    /** 郵便番号 */
    postal_code?: string;
    /** 都道府県 */
    prefectures?: string;
    /** 市区 */
    municipalities?: string;
    /** 町村 */
    town_area?: string;
    /** 番地 */
    area_block_number?: string;
    /** 建物名 */
    building_name?: string;
  };
  /** 企業部署情報テーブル */
  t_companies_department: {
    /** 部署名 */
    department_name?: string;
  };
  /** 企業雇用形態テーブル */
  t_companies_employment_status: {
    /** 雇用形態名 */
    employment_status_name?: string;
  };
};
