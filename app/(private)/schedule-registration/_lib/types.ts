import { z } from 'zod';

/**
 * スケジュールCSV Schema
 */
export const ScheduleCsvSchema = z.object({
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
  /** 単価 */
  list_price: z.coerce.number(),
  /** 売価 */
  sale_price: z.coerce.number(),
  /** キャンセルフラグ */
  cancel_flag: z.coerce.string(),
});

export type ScheduleCsvValues = z.infer<typeof ScheduleCsvSchema>;
