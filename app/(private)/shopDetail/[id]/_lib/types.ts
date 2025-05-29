import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import {
  MSG_EMAIL,
  MSG_MAX,
  MSG_POSTALCODE,
  MSG_REQUIRED,
  REG_POSTALCODE,
  REG_ZENKAKU_KANA,
} from '@/app/_types/constants';
import { UsageStatus } from '@/app/_types/enum';

/**
 * 店舗詳細 検索条件 Schema
 */
export const ShopDetailSchema = z.object({
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
  /** 郵便番号 */
  shop_post_code: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '郵便番号') })
    .regex(new RegExp(REG_POSTALCODE), formatString(MSG_POSTALCODE, '郵便番号')),
  /** 都道府県 */
  shop_prefectures: z.string().nonempty({ message: formatString(MSG_REQUIRED, '都道府県') }),
  /** 市区 */
  shop_municipalities: z.string().nonempty({ message: formatString(MSG_REQUIRED, '市区') }),
  /** 町村 */
  shop_town_area: z.string().nonempty({ message: formatString(MSG_REQUIRED, '町村') }),
  /** 番地 */
  shop_area_block_number: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '番地') })
    .max(128, formatString(MSG_MAX, '番地', '128')),
  /** 建物名 */
  shop_building_name: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '建物名') })
    .max(128, formatString(MSG_MAX, '建物名', '128')),
  /** 電話番号 */
  tel_no: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '電話番号') })
    .max(11, formatString(MSG_MAX, '電話番号', '11')),
  /** メールアドレス */
  mailaddress: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') })
    .email(formatString(MSG_EMAIL, 'メールアドレス'))
    .max(256, formatString(MSG_MAX, '電話番号', '11')),
  /** 表記 */
  specified_commercial_transaction_act: z.string().optional(),
  /** image */
  shop_image: z.string().optional(),
  // shop_image: z
  //   // z.inferでSchemaを定義したときに型がつくようにするため
  //   .instanceof(File)
  //   // 必須にしたい場合
  //   .refine((file) => !file, { message: '必須です。' })
  //   // ファイルサイズを制限したい場合
  //   .refine((file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE, {
  //     message: 'ファイルサイズは最大5MBです。',
  //   })
  //   // 画像形式を制限したい場合
  //   .refine((file) => IMAGE_TYPES.includes(file.type), {
  //     message: '.jpgもしくは.pngのみ可能です。',
  //   }),
  /** ステータス */
  usage_status: z.nativeEnum(UsageStatus),
  /** メモ */
  memo: z
    .string()
    .max(500, formatString(MSG_MAX, 'メモ', '500'))
    .optional(),
});

/**
 * 店舗詳細 検索条件 FormValues
 */
export type ShopDetailFormValues = z.infer<typeof ShopDetailSchema>;
