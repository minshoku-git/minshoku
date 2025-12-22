import { z } from 'zod';

import {
  MSG_EMAIL,
  MSG_INVALID,
  MSG_MAX,
  MSG_POSTALCODE,
  MSG_REQUIRED,
  REG_HANKAKU_NUM,
  REG_ZENKAKU_KANA,
} from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';
import { UsageStatus } from '@/app/_types/enum';

/**
 * 店舗詳細 検索条件 Schema
 */
export const ShopDetailSchema = z
  .object({
    /** 店舗ID */
    id: z.string().optional(),
    /** 店舗名 */
    shop_name: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '店舗名') })
      .max(64, formatString(MSG_MAX, '店舗名', '64')),
    /** 店舗名(カナ) */
    shop_name_kana: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '店舗名(カナ)') })
      .regex(new RegExp(REG_ZENKAKU_KANA), '全角カナで入力してください。')
      .max(256, formatString(MSG_MAX, '店舗名(カナ)', '256')),
    /** 郵便番号(前半) */
    shop_postal_code_prefix: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '郵便番号') })
      .min(3, formatString(MSG_MAX, '郵便番号', '3'))
      .regex(new RegExp(REG_HANKAKU_NUM), formatString(MSG_POSTALCODE, '郵便番号', '3')),
    /** 郵便番号(後半) */
    shop_postal_code_suffix: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '郵便番号') })
      .min(4, formatString(MSG_MAX, '郵便番号', '4'))
      .regex(new RegExp(REG_HANKAKU_NUM), formatString(MSG_POSTALCODE, '郵便番号', '4')),

    /** 住所 */
    shop_address: z.string().nonempty({ message: formatString(MSG_REQUIRED, '都道府県') }),
    /** 番地 */
    shop_area_block_number: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '番地') })
      .max(128, formatString(MSG_MAX, '番地', '128')),
    /** 建物名 */
    shop_building_name: z.string().max(128, formatString(MSG_MAX, '建物名', '128')),
    /** 電話番号 */
    tel_no: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '電話番号') })
      .max(11, formatString(MSG_MAX, '電話番号', '11')),
    /** メールアドレス */
    email: z
      .string()
      .nonempty({ message: formatString(MSG_INVALID, 'メールアドレス') })
      .email(formatString(MSG_EMAIL, 'メールアドレス'))
      .max(256, formatString(MSG_MAX, '電話番号', '11')),
    /** 店舗URL */
    tabelog_url: z.string().url('URL形式ではありません').or(z.literal('')),
    /** 店舗紹介文 */
    shop_description: z.string().optional(),
    /** 特定商取引法に基づく表記 */
    specified_commercial_transaction_act: z.string().optional(),
    /** 利用ステータス */
    usage_status: z.nativeEnum(UsageStatus),
    /** メモ */
    memo: z.string().optional(),
  })
  .strict();

/**
 * 店舗詳細 検索条件 FormValues
 */
export type ShopDetailFormValues = z.infer<typeof ShopDetailSchema>;

/**
 * 店舗詳細 RequestData
 */
export type shopDeteilRequestData = {
  /** 店舗イメージ_ファイル名 */
  shop_image_file_name?: string;
  /** 店舗イメージ_ファイルデータ */
  shop_image_file_data?: File;
  /** 店舗イメージ_ファイルサイズ(byte) */
  shop_image_file_bytesize: number;
} & ShopDetailFormValues;

/**
 * 店舗詳細 ResponseData
 */
export type shopDeteilResponseData = {
  /** 店舗イメージ_ファイル名 */
  shop_image_file_name: string;
  /** 店舗イメージ_URL */
  shop_image_url: string;
} & ShopDetailFormValues;
