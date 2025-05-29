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
  /** 住所_都道府県 */
  prefectures: z.string().optional(),
  /** 住所_市区 */
  municipalities: z.string().optional(),
  /** 住所_町村 */
  town_area: z.string().optional(),
  /** 利用ステータス */
  usage_status: z.union([z.string().optional(), z.nativeEnum(UsageStatus)]),
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
  /** 支店名 */
  post_code: string;
  /** 住所_都道府県 */
  prefectures: string;
  /** 住所_市区 */
  municipalities: string;
  /** 住所_町域 */
  town_area: string;
  /** 番地 */
  area_block_number: string;
  /** 建物名 */
  building_name: string;
  /** 利用ステータス */
  usage_status: string | UsageStatus;
};
