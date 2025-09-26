import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_MAX } from '@/app/_types/constants';
import { UsageStatus } from '@/app/_types/enum';

/**
 * 会社一覧 検索条件 Schema
 */
export const CompanySearchSchema = z.object({
  /** 会社名 */
  company_name: z
    .string()
    .max(64, formatString(MSG_MAX, '会社名', '64'))
    .optional(),
  /** 支店名 */
  branch_name: z
    .string()
    .max(256, formatString(MSG_MAX, '支店名', '256'))
    .optional(),
  /** 住所 */
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
 * 会社一覧 検索条件 FormValues
 */
export type CompanySearchFormValues = z.infer<typeof CompanySearchSchema>;

/** 検索結果 会社一覧 */
export type CompanyListSearchResult = {
  /** ID */
  id: string;
  /** 会社名 */
  company_name: string;
  /** 支店名 */
  branch_name: string;
  /** 郵便番号 */
  postal_code: string;
  /** 住所 */
  address: string;
  /** 番地 */
  area_block_number: string;
  /** 建物名 */
  building_name: string;
  /** 利用ステータス */
  usage_status: string;
};
