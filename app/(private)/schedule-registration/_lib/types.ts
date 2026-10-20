import { z } from 'zod';

import { MSG_DATE, MSG_INTEGER, MSG_REQUIRED } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';

/**
 * 必須の整数列（CSVの文字列 → number）
 * 空欄は0に変換せず必須エラーにする。
 * @param {string} label - 列の表示名
 * @returns {z.ZodType} Schema
 */
const requiredInteger = (label: string) =>
  z
    .string()
    .trim()
    .nonempty({ message: formatString(MSG_REQUIRED, label) })
    .pipe(
      z.coerce
        .number<string>({ error: formatString(MSG_INTEGER, label) })
        .int({ error: formatString(MSG_INTEGER, label) })
    );

/**
 * スケジュールCSV Schema
 */
export const ScheduleCsvSchema = z
  .object({
    /** 納品日 */
    delivery_day: z
      .string()
      .trim()
      .nonempty({ message: formatString(MSG_REQUIRED, '納品日') })
      .pipe(z.coerce.date<string>({ error: formatString(MSG_DATE, '納品日') })),
    /** 会社ID */
    t_companies_id: requiredInteger('会社ID'),
    /** 店舗ID */
    t_shops_id: requiredInteger('店舗ID'),
    /** メニュー名 */
    menu_name: z.string(),
    /** メニュー紹介 */
    menu_description: z.string(),
    /** アレルギー表記 */
    allergen_labelling: z.string().optional(),
    /** 辛さレベル */
    spice_level: requiredInteger('辛さレベル'),
    /** 在庫数 */
    stock_count: requiredInteger('在庫数'),
    /** 注文数 */
    order_count: requiredInteger('注文数'),
    /** 定価 */
    list_price: requiredInteger('定価'),
    /** キャンセルフラグ */
    cancel_flag: z.coerce.string(),
  })
  .strict();

export type ScheduleCsvValues = z.infer<typeof ScheduleCsvSchema>;

/** CSVの列名（見出し行）一覧。列数チェック・見出しチェックに使用 */
export const SCHEDULE_CSV_COLUMNS = Object.keys(ScheduleCsvSchema.shape) as (keyof ScheduleCsvValues)[];

/** CSVの行番号付きデータ（エラー時に何行目かを表示するため） */
export type ScheduleCsvRow = {
  /** CSV上の行番号（見出し行=1） */
  line: number;
  /** 検証済みデータ */
  data: ScheduleCsvValues;
};

/** 登録・更新対象外となった行のデータ型 */
export type FailedScheduleRow = {
  delivery_day: string;
  t_companies_id: number;
  t_shops_id: number;
  menu_name: string;
};

/** CSV一括処理全体のレスポンス型 */
export type ScheduleRegistrationResult = {
  successCount: number;
  failedRows: FailedScheduleRow[];
};
