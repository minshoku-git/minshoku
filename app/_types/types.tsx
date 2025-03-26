import { z } from 'zod';

/**
 * types.tsx
 * 全機能共通で使用する型定義を管理します。
 * なるべくココで定義すること！
 */

// TODO: 各画面で用意するか悩み中。DB取得処理記述のタイミングで見直す。

export type SearchResultProps = {
  // 明細行リンクハンドラー
  linkHandler?: (id: string) => void;
  // ヘッダー情報
  header: string[];
  // 検索結果
  result: Array<unknown>;
};

/* おためし 検索条件 */
export type SearchFormValues = {
  firstName: string;
  lastName: string;
  telNumber: string;
  address: string;
  memo: string;
  date: string | undefined;
};

/* オーダー一覧 検索条件 */
export type OrderSearchFormValues = {
  /* 配送日(FROM) */
  deliveryFrom: string;
  /* 配送日(TO) */
  deliveryTo: string;
  /* ユーザー名 */
  userName: string;
  /* 会社名 */
  companyName: string;
  /* 支店名 */
  branchName: string;
  /* ステータス */
  status: string;
};

/* 店舗一覧 検索条件 */
export type ShopSearchFormValues = {
  /* 店舗名 */
  shopName: string;
  /* 都道府県 */
  state: string;
  /* 市 */
  city: string;
  /* 町村 */
  town: string;
  /* ステータス */
  status: string;
};

/* ユーザー一覧 検索条件 */
export type UserSearchFormValues = {
  /* ユーザー名 */
  userName: string;
  /* 会社名 */
  companyName: string;
  /* ステータス */
  status: string;
};

/* 会社一覧 検索条件 */
export type CompanySearchFormValues = {
  /* 店舗名 */
  companyName: string;
  /* 都道府県 */
  state: string;
  /* 市 */
  city: string;
  /* 町村 */
  town: string;
  /* ステータス */
  status: string;
};

/* オーダー一覧 検索条件 */
export type ScheduleSearchFormValues = {
  /* 配送日(FROM) */
  deliveryFrom: string;
  /* 配送日(TO) */
  deliveryTo: string;
  /* 会社名 */
  companyName: string;
  /* 店舗名 */
  branchName: string;
};

function formatString(template: string, ...args: (string | number)[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return index < args.length ? String(args[index]) : match;
  });
}

const required_msg = '{0}は必須入力です。';
const max_msg = '{0}は{1}文字以内で入力してください。';
const mail_msg = '{0}は正しく入力してください。';
const ZENKAKU_KANA = '^[\u30A0-\u30FF]+$';
const HANKAKU_EISU = '/^[a-zA-Z0-9]+$/u';

const IMAGE_TYPES = ['image/jpg', 'image/png'];
const MAX_IMAGE_SIZE = 5; // 5MB

// バイト単位のサイズをメガバイト単位に変換する
const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

export const ShopDetailSchemaType = z.object({
  /* 店舗ID */
  shopId: z.string().optional(),
  /* 店舗名 */
  shopName: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '店舗名') })
    .max(64, formatString(max_msg, '店舗名', '64')),
  /* 店舗名(カナ) */
  shopNameKana: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '店舗名(カナ)') })
    .regex(new RegExp(ZENKAKU_KANA), '全角カナで入力してください。')
    .max(256, formatString(max_msg, '店舗名(カナ)', '256')),
  /* 郵便番号 */
  postalCode: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, 'メールアドレス') })
    .max(7, formatString(max_msg, '郵便番号', '7')),
  /* 都道府県 */
  state: z.string().nonempty({ message: formatString(required_msg, '都道府県') }),
  /* 市 */
  city: z.string().nonempty({ message: formatString(required_msg, '市') }),
  /* 町村 */
  town: z.string().nonempty({ message: formatString(required_msg, '町村') }),
  /* 番地 */
  houseNumber: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '番地') })
    .max(128, formatString(max_msg, '番地', '128')),
  /* 建物名 */
  buildingName: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '建物名') })
    .max(128, formatString(max_msg, '建物名', '128')),
  /* 電話番号 */
  telNumber: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '電話番号') })
    .max(11, formatString(max_msg, '電話番号', '11')),
  /* メールアドレス */
  mailAddress: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, 'メールアドレス') })
    .email(formatString(mail_msg, 'メールアドレス'))
    .max(256, formatString(max_msg, '電話番号', '11')),
  /* 表記 */
  hyoki: z.string().optional(),
  /* image */
  image: z
    // z.inferでSchemaを定義したときに型がつくようにするため
    .instanceof(File)
    // 必須にしたい場合
    .refine((file) => !file, { message: '必須です' })
    // ファイルサイズを制限したい場合
    .refine((file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE, {
      message: 'ファイルサイズは最大5MBです',
    })
    // 画像形式を制限したい場合
    .refine((file) => IMAGE_TYPES.includes(file.type), {
      message: '.jpgもしくは.pngのみ可能です',
    }),
  /* ステータス */
  status: z.string().nonempty({ message: formatString(required_msg, 'ステータス') }),
  /* メモ */
  memo: z
    .string()
    .max(500, formatString(max_msg, 'メモ', '500'))
    .optional(),
});
export type ShopDetailSchema = z.infer<typeof ShopDetailSchemaType>;

/* 会社詳細 FormValues */
export const CompanyDetailSchema = z.object({
  /* 会社名 */
  companyName: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '会社名') })
    .max(64, formatString(max_msg, '会社名', '64')),
  /* 支店名 */
  branchName: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '支店名') })
    .max(256, formatString(max_msg, '支店名', '256')),
  /* 食堂名 */
  cafeteriaName: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '食堂名') })
    .max(256, formatString(max_msg, '食堂名', '256')),
  /* 郵便番号 */
  postalCode: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '郵便番号') })
    .max(7, formatString(max_msg, '郵便番号', '7')),
  /* 都道府県 */
  state: z.string().nonempty({ message: formatString(required_msg, '都道府県') }),
  /* 市 */
  city: z.string().nonempty({ message: formatString(required_msg, '市') }),
  /* 町村 */
  town: z.string().nonempty({ message: formatString(required_msg, '町村') }),
  /* 番地 */
  houseNumber: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '番地') })
    .max(128, formatString(max_msg, '番地', '128')),
  /* 建物名 */
  buildingName: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '建物名') })
    .max(128, formatString(max_msg, '建物名', '128')),
  /* 提供場所 */
  location: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, '提供場所') })
    .max(128, formatString(max_msg, '提供場所', '128')),
  /* メールアドレス */
  mailAddress: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, 'メールアドレス') })
    .email(formatString(mail_msg, 'メールアドレス'))
    .max(256, formatString(max_msg, 'メールアドレス', '256')),
  /* 連絡先・メモ */
  memo: z.string().optional(),
  /* 部署情報 */
  departmentInfo: z.string().array(),
  /* 雇用種別情報 */
  employmentTypeInfo: z.string().array(),
  /* 任意項目1(項目名) */
  anyItem1: z.string().optional(),
  /* 任意項目1(注釈) */
  annotation1: z.string().optional(),
  /* 任意項目1(項目名) */
  anyItem2: z.string().optional(),
  /* 任意項目1(注釈) */
  annotation2: z.string().optional(),
  /* 提供時間(FROM) */
  availabilityFrom: z.string().optional(),
  /* 提供時間(TO) */
  availabilityTo: z.string().optional(),
  /* 注文期限(日付) */
  orderDeadlineDay: z.string().optional(),
  /* 注文期限(時) */
  orderDeadlineHour: z.string().optional(),
  /* 注文期限(分) */
  orderDeadlineMin: z.string().optional(),
  /* キャンセル期限(日付) */
  cancelDeadlineDay: z.string().optional(),
  /* キャンセル期限(時間) */
  cancelDeadlineHour: z.string().optional(),
  /* キャンセル期限(分) */
  cancelDeadlineMin: z.string().optional(),
});
export type CompanyDetailFormValues = z.infer<typeof CompanyDetailSchema>;

/* ユーザー詳細 */
export const UserDetailSchema = z.object({
  /* ステータス */
  restriction: z.string().nonempty({ message: formatString(required_msg, '利用制限') }),
  /* メモ */
  memo: z
    .string()
    .max(500, formatString(max_msg, 'メモ', '500'))
    .optional(),
});
export type UserDetailFormValues = z.infer<typeof UserDetailSchema>;
