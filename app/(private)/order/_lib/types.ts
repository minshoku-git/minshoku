import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_INVALID, MSG_MAX, MSG_REQUIRED } from '@/app/_types/constants';
import { OrderStatusType } from '@/app/_types/enum';

/**
 * オーダー一覧 検索条件 Schema
 */
export const OrderSearchSchema = z
  .object({
    /** 配達日(FROM) */
    deliveryFrom: z
      .date()
      .nullable()
      .refine((val) => val === null || !isNaN(val.getTime()), {
        message: formatString(MSG_INVALID, '配達日(FROM)'),
      }),
    /** 配達日(TO) */
    deliveryTo: z
      .date()
      .nullable()
      .refine((val) => val === null || !isNaN(val.getTime()), {
        message: formatString(MSG_INVALID, '配達日(TO)'),
      }),
    /** ユーザー名 */
    user_name: z.string().optional(),
    /** 会社名 */
    company_name: z
      .string()
      .max(64, formatString(MSG_MAX, '会社名', '64'))
      .optional(),
    /** 注文ステータス */
    order_status_type: z
      .union([z.literal('0'), z.string().optional(), z.nativeEnum(OrderStatusType)])
      .transform((value) => {
        // 空文字列をundefinedに変換し、'0'はそのまま残す
        if (value === '') {
          return undefined;
        }
        return value;
      }),
  })
  /** 提供時間 FROM<TOではない */
  .check((ctx) => {
    if (!ctx.value.deliveryFrom && !ctx.value.deliveryTo) {
      ctx.issues.push({
        code: 'custom',
        path: ['deliveryFrom'],
        message: 'いずれかの日を入力してください。',
        input: ctx.value,
      });
      ctx.issues.push({
        code: 'custom',
        path: ['deliveryTo'],
        message: 'いずれかの日を入力してください。',
        input: ctx.value,
      });
    }
    if (ctx.value.deliveryFrom && ctx.value.deliveryTo) {
      if (ctx.value.deliveryFrom > ctx.value.deliveryTo) {
        ctx.issues.push({
          code: 'custom',
          path: ['deliveryFrom'],
          message: '開始時間は終了時間より早い時間を設定してください。',
          input: ctx.value,
        });
        ctx.issues.push({
          code: 'custom',
          path: ['deliveryTo'],
          message: '終了時間は開始時間より遅い時間を設定してください。',
          input: ctx.value,
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
  payment_type: string;
  /** 注文ステータス */
  order_status_type: string;
};

/** 取得結果 オーダー詳細 */
export type orderDeteilResponseData = {
  /** id */
  id?: string;
  /** 納品日 */
  delivery_day?: string | Date;
  /** 個数 */
  count?: number;
  /** 定価 */
  list_price?: number;
  /** 総額 */
  amount?: number;
  /** 企業負担額 */
  companies_burden_amount?: number;
  /** 個人負担額 */
  user_burden_amount?: number;
  /** 支払い種別 */
  payment_type?: string | number;
  /** オーダーステータス */
  order_status_type?: string;
  /** 注文日時 */
  order_datetime?: string | Date;
  /** キャンセル日時 */
  cancel_datetime?: string | Date;
  /** 累計注文数 */
  totalOrderCount: number;
  /** 最終注文日 */
  lastOrderDateTime: string;
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
    /** ユーザーID */
    id?: number;
    /** ユーザー名 */
    user_name?: string;
    /** ユーザー名カナ */
    user_name_kana?: string;
    /** メールアドレス */
    user_email?: string;
    /** 任意項目_回答1 */
    optional_item_answer_1?: string;
    /** 任意項目_回答2 */
    optional_item_answer_2?: string;
  };
  /** 会社テーブル */
  t_companies: {
    /** ユーザーID */
    id?: number;
    /** 会社名 */
    company_name?: string;
    /** 支店名 */
    branch_name?: string;
    /** 任意項目_項目名1 */
    optional_item_title_1?: string;
    /** 任意項目_項目名2 */
    optional_item_title_2?: string;
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
