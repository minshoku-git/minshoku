import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_INVALID, MSG_MAX, MSG_REQUIRED } from '@/app/_types/constants';

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
    userName: z.string().optional(),
    /** 会社名 */
    companyName: z
      .string()
      .max(64, formatString(MSG_MAX, '会社名', '64'))
      .optional(),
    /** 支店名 */
    branchName: z
      .string()
      .max(64, formatString(MSG_MAX, '会社名', '64'))
      .optional(),
    /** ステータス */
    status: z.string().optional(),
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
  order_state: string;
};
