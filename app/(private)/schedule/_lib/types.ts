import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_INVALID, MSG_MAX, MSG_REQUIRED } from '@/app/_types/constants';

/**
 * スケジュール一覧 検索条件 Schema
 */
export const ScheduleSearchSchema = z
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
    /** 会社名 */
    company_name: z
      .string()
      .max(64, formatString(MSG_MAX, '会社名', '64'))
      .optional(),
    /** ステータス */
    shop_name: z
      .string()
      .max(64, formatString(MSG_MAX, '店舗名', '64'))
      .optional(),
  }) /** 提供時間 FROM<TOではない */
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
 * スケジュール一覧 検索条件 FormValues
 */
export type ScheduleSearchFormValues = z.infer<typeof ScheduleSearchSchema>;

/** 検索結果 スケジュール一覧 */
export type ScheduleListSearchResult = {
  /** スケジュールデータ */
  scheduleDatas: ScheduleData[];
  /** 合計食数 */
  orderAmout: number;
};

/** 検索結果 スケジュール一覧 */
export type ScheduleData = {
  /** ID */
  id: string;
  /** 納品日 */
  delivery_day: string;
  /** 会社名 */
  company_name: string;
  /** 支店名 */
  branch_name: string;
  /** 店舗名 */
  shop_name: string;
  /** メニュー名 */
  menu_name: string;
  /** 食数 */
  order_count: number;
  /** アレルギー */
  allergen_labelling: string;
};

/** 検索結果 スケジュール一覧 */
export type Testcsv = {
  /** ID */
  id: string;
  /** メニュー名 */
  menu_name: string;
};
