import { z } from 'zod';

/**
 * スケジュールCSV Schema
 */
export const ScheduleCsvSchema = z
  .object({
    /** 納品日 */
    delivery_day: z.coerce.date(),
    /** 会社ID */
    t_companies_id: z.coerce.number(),
    /** 店舗ID */
    t_shops_id: z.coerce.number(),
    /** メニュー名 */
    menu_name: z.string(),
    /** メニュー紹介 */
    menu_description: z.string(),
    /** アレルギー表記 */
    allergen_labelling: z.string().optional(),
    /** 辛さレベル */
    spice_level: z.coerce.number(),
    /** 在庫数 */
    stock_count: z.coerce.number(),
    /** 注文数 */
    order_count: z.coerce.number(),
    /** 定価 */
    list_price: z.coerce.number(),
    /** キャンセルフラグ */
    cancel_flag: z.coerce.string(),
  })
  .strict();

export type ScheduleCsvValues = z.infer<typeof ScheduleCsvSchema>;

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
