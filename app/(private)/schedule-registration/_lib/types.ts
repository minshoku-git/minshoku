import { z } from 'zod';

import { MSG_CSV_CANCEL_FLAG, MSG_DATE, MSG_INTEGER, MSG_REQUIRED } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';
import { ScheduleCancelFlag } from '@/app/_types/enum';

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
    /** 注文数（任意。DBには保存しない） */
    order_count: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || Number.isInteger(Number(v)), { message: formatString(MSG_INTEGER, '注文数') }),
    /** 定価 */
    list_price: requiredInteger('定価'),
    /** キャンセルフラグ（0:有効 / 1:キャンセル） */
    cancel_flag: z
      .string()
      .trim()
      .pipe(
        z.enum(ScheduleCancelFlag, {
          // 空欄は必須エラー、それ以外は0/1以外のエラー（空欄で2件出さないよう1つのチェックにまとめる）
          error: (issue) => (issue.input === '' ? formatString(MSG_REQUIRED, 'キャンセルフラグ') : MSG_CSV_CANCEL_FLAG),
        })
      ),
  })
  .strict();

export type ScheduleCsvValues = z.infer<typeof ScheduleCsvSchema>;

/** CSVの列名（見出し行）一覧。列数チェック・見出しチェックに使用 */
export const SCHEDULE_CSV_COLUMNS = Object.keys(ScheduleCsvSchema.shape) as (keyof ScheduleCsvValues)[];

/** 見出し行に無くてもよい列（未使用の列のため） */
export const SCHEDULE_CSV_OPTIONAL_COLUMNS: (keyof ScheduleCsvValues)[] = ['order_count'];

/** CSVの行番号付きデータ（エラー時に何行目かを表示するため） */
export type ScheduleCsvRow = {
  /** CSV上の行番号（見出し行=1） */
  line: number;
  /** 検証済みデータ */
  data: ScheduleCsvValues;
};

/** 登録できなかった行に紐づく有効な注文 */
export type BlockingOrder = {
  /** 注文ID */
  id: number;
  /** 利用者名 */
  user_name: string;
  /** 個数 */
  count: number;
  /** 注文日時（YYYY/MM/DD HH:mm） */
  order_datetime: string;
};

/** 登録・更新対象外となった行のデータ型 */
export type FailedScheduleRow = {
  /** CSV上の行番号（見出し行=1） */
  line: number;
  delivery_day: string;
  t_companies_id: number;
  t_shops_id: number;
  menu_name: string;
  /** 登録できなかった理由 */
  reason: string;
  /** 登録の妨げになっている有効な注文（キャンセル済みの店舗に注文が残っている場合のみ） */
  orders?: BlockingOrder[];
};

/** CSV一括処理全体のレスポンス型 */
export type ScheduleRegistrationResult = {
  successCount: number;
  failedRows: FailedScheduleRow[];
};
