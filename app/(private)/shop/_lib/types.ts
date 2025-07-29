import { z } from 'zod';

import { UsageStatus } from '@/app/_types/enum';

/**
 * 店舗一覧 検索条件 スキーマ
 */
export const ShopSearchSchema = z.object({
  /** 店舗名 */
  shop_name: z.string().optional(),
  /** 都道府県 */
  address: z.string().optional(),
  /** 利用ステータス */
  usage_status: z.union([z.string().optional(), z.nativeEnum(UsageStatus)]),
});

/**
 * 店舗一覧 検索条件 FormValues
 */
export type ShopSearchFormValues = z.infer<typeof ShopSearchSchema>;

/** 検索結果 店舗一覧 */
export type ShopListSearchResult = {
  /** ID */
  id: string;
  /** 店舗名 */
  shop_name?: string;
  /** 郵便番号 */
  shop_postal_code?: string;
  /** 住所 */
  address?: string;
  /** 利用ステータス */
  usage_status?: string;
};
