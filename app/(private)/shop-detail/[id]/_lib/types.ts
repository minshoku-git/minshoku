import { z } from 'zod';

import {
  IMAGE_TYPES,
  MSG_EMAIL,
  MSG_MAX,
  MSG_POSTALCODE,
  MSG_REQUIRED,
  REG_HANKAKU_NUM,
  REG_ZENKAKU_KANA,
} from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';
import { UsageStatus } from '@/app/_types/enum';

/**
 * 初期表示 入力用バリデーションスキーマ
 */
export const ShopDetailInitSchema = z.object({
  id: z.number(),
});
/**
 * 初期表示 API用バリデーションスキーマ
 */
export const ShopDetailInitApiSchema = z
  .object({
    request: ShopDetailInitSchema,
  })
  .strict();
// 初期表示 FormValues
export type ShopDetailInitValues = z.infer<typeof ShopDetailInitSchema>;

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
      .max(11, formatString(MSG_MAX, '電話番号', '12')),
    /** メールアドレス */
    email: z
      .email(formatString(MSG_EMAIL, 'メールアドレス'))
      .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') }),
    /** GMO ID */
    gmo_shop_code: z
      .string()
      .max(64, formatString(MSG_MAX, 'GMO ID', '64'))
      .optional(),
    /** GMO PASS */
    gmo_shop_password: z
      .string()
      .max(64, formatString(MSG_MAX, 'GMO PASS', '64'))
      .optional(),
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
 * 会社新規登録・会社更新 添付ファイル用バリデーションスキーマ
 */
export const ShopImageFileSchema = z
  .object({
    shop_image_file_data: z.file().nullable(),
    shop_image_file_name: z.string().optional(),
    shop_image_file_bytesize: z.number(),
  })
  .strict();

/**
 * 会社新規登録・会社更新 API用バリデーションスキーマ
 */
export const ShopDetailApiSchema = z
  .object({
    request: z.object({
      ...ShopDetailSchema.shape,
      ...ShopImageFileSchema.shape,
    }),
  })
  .strict();

/**
 * 店舗詳細 検索条件 FormValues
 */
export type ShopDetailFormValues = z.infer<typeof ShopDetailSchema>;

/**
 * 店舗詳細 RequestData
 */
export type shopDeteilRequestData = z.infer<typeof ShopDetailApiSchema>['request'];

/**
 * 店舗詳細 ResponseData
 */
export type shopDeteilResponseData = {
  /** 店舗イメージ_ファイル名 */
  shop_image_file_name: string;
  /** 店舗イメージ_URL */
  shop_image_url: string;
} & ShopDetailFormValues;
