import { z } from 'zod';

import { UsageStatus } from '@/app/_types/enum';
import { PaginateData } from '@/app/_types/types';

/**
 * 店舗一覧 検索条件 スキーマ
 */
export const ShopSearchSchema = z.object({
  /** 店舗名 */
  shop_name: z.string().optional(),
  /** 都道府県 */
  address: z.string().optional(),
  /** 利用ステータス */
  usage_status: z.union([z.literal('0'), z.string().optional(), z.nativeEnum(UsageStatus)]).transform((value) => {
    // 空文字列をundefinedに変換し、'0'はそのまま残す
    if (value === '') {
      return undefined;
    }
    return value;
  }),
});

/**
 * 店舗一覧 検索条件 FormValues
 */
export type ShopSearchFormValues = z.infer<typeof ShopSearchSchema>;

/** 検索結果 店舗一覧 */
export type ShopListSearchResult = {
  /** 店舗情報配列 */
  shopDatas: ShopData[];
  /** ページネート */
  paginate?: PaginateData;
};

/** 店舗情報 */
export type ShopData = {
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
