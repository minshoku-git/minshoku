import { z } from 'zod';

import { SortType, UsageStatus, UserUsageStatus } from './enum';

/**
 * types.tsx
 * 全機能共通で使用する型定義を管理します。
 * なるべくココで定義すること！
 */

// TODO: 各画面で用意するか悩み中。DB取得処理記述のタイミングで見直す。

/* バリデーションメッセージ置換の関数 */
function formatString(template: string, ...args: (string | number)[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return index < args.length ? String(args[index]) : match;
  });
}

/* バリデーションメッセージ
------------------------------------------------------------------ */
const MSG_REQUIRED = '{0}は必須入力です。';
const MSG_INVALID = '{0}を正しく入力してください。';
const MSG_MAX = '{0}は{1}文字以内で入力してください。';
const MSG_EMAIL = '{0}は正しく入力してください。';
const MSG_POSTALCODE = '{0}は半角数字7桁を入力してください。';
const MSG_HANKAKU_NUM = '{0}は半角数字を入力してください。';

/* 正規表現集
------------------------------------------------------------------ */
const REG_POSTALCODE = '^[0-9]{7}';
const REG_HANKAKU_EISU = '/^[a-zA-Z0-9]+$/u';
const REG_HANKAKU_NUM = '^\\d+$';
const REG_ZENKAKU_KANA = '^[\u30A0-\u30FF]+$';

const IMAGE_TYPES = ['image/jpg', 'image/png'];
const MAX_IMAGE_SIZE = 5; // 5MB

/* 検索結果 テーブルヘッダー
------------------------------------------------------------------ */
export type HeaderStatus = {
  // ヘッダー名
  name: string;
  // 変数名
  variableName: string;
  // ソートタイプ 0:昇順, 1:降順
  sort: SortType;
};

/* Schema and FormValues
------------------------------------------------------------------ */
/**
 * 店舗一覧 検索条件 スキーマ
 */
export const ShopSearchSchema = z.object({
  /* 店舗名 */
  shop_name: z.string().optional(),
  /* 都道府県 */
  prefectures: z.string().optional(),
  /* 市区 */
  municipalities: z.string().optional(),
  /* 町村 */
  town_area: z.string().optional(),
  /* 利用ステータス */
  usage_status: z.union([z.string().optional(), z.nativeEnum(UsageStatus)]),
});

/**
 * 店舗一覧 検索条件 FormValues
 */
export type ShopSearchFormValues = z.infer<typeof ShopSearchSchema>;

/**
 * 店舗詳細 検索条件 スキーマ
 */
export const ShopDetailSchemaType = z.object({
  /* 店舗ID */
  id: z.string().optional(),
  /* 店舗名 */
  shop_name: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '店舗名') })
    .max(64, formatString(MSG_MAX, '店舗名', '64')),
  /* 店舗名(カナ) */
  shop_name_kana: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '店舗名(カナ)') })
    .regex(new RegExp(REG_ZENKAKU_KANA), '全角カナで入力してください。')
    .max(256, formatString(MSG_MAX, '店舗名(カナ)', '256')),
  /* 郵便番号 */
  shop_post_code: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '郵便番号') })
    .regex(new RegExp(REG_POSTALCODE), formatString(MSG_POSTALCODE, '郵便番号')),
  /* 都道府県 */
  shop_prefectures: z.string().nonempty({ message: formatString(MSG_REQUIRED, '都道府県') }),
  /* 市区 */
  shop_municipalities: z.string().nonempty({ message: formatString(MSG_REQUIRED, '市区') }),
  /* 町村 */
  shop_town_area: z.string().nonempty({ message: formatString(MSG_REQUIRED, '町村') }),
  /* 番地 */
  shop_area_block_number: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '番地') })
    .max(128, formatString(MSG_MAX, '番地', '128')),
  /* 建物名 */
  shop_building_name: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '建物名') })
    .max(128, formatString(MSG_MAX, '建物名', '128')),
  /* 電話番号 */
  tel_no: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '電話番号') })
    .max(11, formatString(MSG_MAX, '電話番号', '11')),
  /* メールアドレス */
  mailaddress: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') })
    .email(formatString(MSG_EMAIL, 'メールアドレス'))
    .max(256, formatString(MSG_MAX, '電話番号', '11')),
  /* 表記 */
  specified_commercial_transaction_act: z.string().optional(),
  /* image */
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
  /* ステータス */
  usage_status: z.nativeEnum(UsageStatus),
  /* メモ */
  memo: z
    .string()
    .max(500, formatString(MSG_MAX, 'メモ', '500'))
    .optional(),
});
/**
 * 店舗詳細 検索条件 FormValues
 */
export type ShopDetailFormValues = z.infer<typeof ShopDetailSchemaType>;

/**
 * 会社一覧 検索条件 スキーマ
 */
export const CompanySearchSchema = z.object({
  /* 会社名 */
  company_name: z
    .string()
    .max(64, formatString(MSG_MAX, '会社名', '64'))
    .optional(),
  /* 支店名 */
  branch_name: z
    .string()
    .max(256, formatString(MSG_MAX, '支店名', '256'))
    .optional(),
  /* 住所_都道府県 */
  prefectures: z.string().optional(),
  /* 住所_市区 */
  municipalities: z.string().optional(),
  /* 住所_町村 */
  town_area: z.string().optional(),
  /* 利用ステータス */
  usage_status: z.union([z.string().optional(), z.nativeEnum(UsageStatus)]),
});

/**
 * 会社一覧 検索条件 FormValues
 */
export type CompanySearchFormValues = z.infer<typeof CompanySearchSchema>;

/**
 * 会社詳細 検索条件 スキーマ
 */
export const CompanyDetailSchema = z
  .object({
    id: z.string().optional(),
    /* 会社名 */
    company_name: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '会社名') })
      .max(64, formatString(MSG_MAX, '会社名', '64')),
    /* 支店名 */
    branch_name: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '支店名') })
      .max(256, formatString(MSG_MAX, '支店名', '256')),
    /* 食堂名 */
    restaurant_name: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '食堂名') })
      .max(256, formatString(MSG_MAX, '食堂名', '256')),
    /* 郵便番号 */
    post_code: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '郵便番号') })
      .regex(new RegExp(REG_POSTALCODE), formatString(MSG_POSTALCODE, '郵便番号')),
    /* 都道府県 */
    prefectures: z.string().nonempty({ message: formatString(MSG_REQUIRED, '都道府県') }),
    /* 市区 */
    municipalities: z.string().nonempty({ message: formatString(MSG_REQUIRED, '市区') }),
    /* 町村 */
    town_area: z.string().nonempty({ message: formatString(MSG_REQUIRED, '町村') }),
    /* 番地 */
    area_block_number: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '番地') })
      .max(128, formatString(MSG_MAX, '番地', '128')),
    /* 建物名 */
    building_name: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '建物名') })
      .max(128, formatString(MSG_MAX, '建物名', '128')),
    /* 提供場所 */
    location: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '提供場所') })
      .max(128, formatString(MSG_MAX, '提供場所', '128')),
    /* メールアドレス */
    mailaddress: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') })
      .email(formatString(MSG_EMAIL, 'メールアドレス'))
      .max(256, formatString(MSG_MAX, 'メールアドレス', '256')),
    /* 連絡先・メモ */
    memo: z.string().optional(),
    /* 部署情報(Array) */
    departmentInfo: z
      .object({
        /* 部署ID */
        id: z.string(),
        /* 部署名 */
        name: z.string().nonempty({ message: formatString(MSG_REQUIRED, '部署情報') }),
        /* 編集不可 ※true:編集不可(非活性)/false:編集可能(活性) */
        disabled: z.boolean(),
        /* 削除フラグ ※true:削除/false:有効 */
        delete_flag: z.boolean(),
      })
      .array(),
    /* 雇用種別情報(Array) */
    employmentStatusInfo: z
      .object({
        /* 雇用種別ID */
        id: z.string(),
        /* 雇用種別名 */
        employment_status_name: z.string(),
        /* 決済方法(控除) */
        deduction_flag: z.boolean(),
        /* 決済方法(クレジットカード) */
        credit_flag: z.boolean(),
        /* 決済方法(PayPay) */
        paypay_flag: z.boolean(),
        /* 会社負担 */
        set_meal_burden: z.string(),
        /* 編集不可 true:編集不可(非活性),false:編集可能(活性) */
        disabled: z.boolean(),
        /* 削除フラグ ※true:削除/false:有効 */
        delete_flag: z.boolean(),
      })
      .array(),
    /* 任意項目1(項目名) */
    optional_item_title_1: z.string().optional(),
    /* 任意項目1(注釈) */
    optional_item_notes_1: z.string().optional(),
    /* 任意項目1(項目名) */
    optional_item_title_2: z.string().optional(),
    /* 任意項目1(注釈) */
    optional_item_notes_2: z.string().optional(),
    /* 提供時間(FROM) */
    offer_time_from: z.date({
      errorMap: (issue, {}) => ({
        message:
          issue.code === 'invalid_date'
            ? formatString(MSG_INVALID, '開始時間')
            : formatString(MSG_REQUIRED, '開始時間'),
      }),
    }),
    /* 提供時間(TO) */
    offer_time_to: z.date({
      errorMap: (issue, {}) => ({
        message:
          issue.code === 'invalid_date'
            ? formatString(MSG_INVALID, '終了時間')
            : formatString(MSG_REQUIRED, '終了時間'),
      }),
    }),
    /* 注文期限(日付) */
    order_period_day: z.string().nonempty({ message: formatString(MSG_REQUIRED, '日') }),
    /* 注文期限(時間) */
    order_period_time: z.date({
      errorMap: (issue, {}) => ({
        message: issue.code === 'invalid_date' ? formatString(MSG_INVALID, '時間') : formatString(MSG_REQUIRED, '時間'),
      }),
    }),
    /* キャンセル期限(日付) */
    cancel_period_day: z.string().nonempty({ message: formatString(MSG_REQUIRED, '日') }),
    /* キャンセル期限(時間) */
    cancel_period_time: z.date({
      errorMap: (issue, {}) => ({
        message: issue.code === 'invalid_date' ? formatString(MSG_INVALID, '時間') : formatString(MSG_REQUIRED, '時間'),
      }),
    }),
    /* 利用ステータス */
    usage_status: z.nativeEnum(UsageStatus),
  })
  /* カスタムバリデーション
  ------------------------------------------------------------------ */
  // .refine((data) => data.offer_time_from, {
  //   path: ['offer_time_from'],
  //   message: formatString(MSG_REQUIRED, '開始時間'),
  // })
  // .refine((data) => data.offer_time_to, {
  //   path: ['offer_time_to'],
  //   message: formatString(MSG_REQUIRED, '終了時間'),
  // })
  /* 任意項目1 注釈のみの入力はOUT */
  .refine((data) => !(data.optional_item_title_1 === '' && data.optional_item_notes_1 !== ''), {
    path: ['optional_item_title_1'],
    message: '項目名を入力してください。',
  })
  /* 任意項目2 注釈のみの入力はOUT */
  .refine((data) => !(data.optional_item_title_2 === '' && data.optional_item_notes_2 !== ''), {
    path: ['optional_item_title_2'],
    message: '項目名を入力してください。',
  })
  /* 部署情報 部署名の重複 */
  .superRefine((data, ctx) => {
    data.departmentInfo.forEach((item, index) => {
      const filterLength = data.departmentInfo.filter((f) => f.name === item.name).length;
      if (filterLength > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`departmentInfo.${index}.name`],
          message: '部署名が重複しています。',
        });
      }
    });
  })
  /* 雇用種別情報 雇用形態名の重複 */
  .superRefine((data, ctx) => {
    data.employmentStatusInfo.forEach((item, index) => {
      const filterLength = data.employmentStatusInfo.filter(
        (f) => f.employment_status_name === item.employment_status_name
      ).length;
      if (filterLength > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentStatusInfo.${index}.employment_status_name`],
          message: '雇用形態名が重複しています。',
        });
      }
    });
  })
  /* 雇用種別情報 チェックボックスがすべてOFFはOUT */
  .superRefine((data, ctx) => {
    data.employmentStatusInfo.forEach((e, index) => {
      if (!e.employment_status_name && (e.deduction_flag || e.credit_flag || e.paypay_flag)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentStatusInfo.${index}.employment_status_name`],
          message: formatString(MSG_REQUIRED, '雇用形態名'),
        });
      }
      if (e.employment_status_name && !e.deduction_flag && !e.credit_flag && !e.paypay_flag) {
        // チェックボックスにメッセージが収まらないので、業務形態名で出します！
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentStatusInfo.${index}.employment_status_name`],
          message: '決済方法を1つ以上選択してください。',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentStatusInfo.${index}.deduction_flag`],
          message: '',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentStatusInfo.${index}.credit_flag`],
          message: '',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentStatusInfo.${index}.paypay_flag`],
          message: '',
        });
      }
      const regex1 = new RegExp(REG_HANKAKU_NUM);
      console.log('testtesttest!!!!!!!!!!!!!!!!!!!!!!');
      console.log(e.set_meal_burden);
      console.log(regex1.test(e.set_meal_burden));
      if (!regex1.test(e.set_meal_burden)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentStatusInfo.${index}.set_meal_burden`],
          message: formatString(MSG_HANKAKU_NUM, '会社負担額'),
        });
      }
    });
  })
  /* 提供時間 FROM<TOではない */
  .superRefine((data, ctx) => {
    if (data.offer_time_from && data.offer_time_to) {
      if (data.offer_time_from >= data.offer_time_to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['offer_time_from'],
          message: '開始時間は終了時間より早い時間を設定してください。',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['offer_time_to'],
          message: '終了時間は開始時間より遅い時間を設定してください。',
        });
      }
    }
  });
/**
 * 会社詳細 検索条件 FormValues
 */
export type CompanyDetailFormValues = z.infer<typeof CompanyDetailSchema>;

/* ユーザー詳細 */
export const UserDetailSchema = z.object({
  /* ステータス */
  usage_status: z.nativeEnum(UsageStatus),
  /* メモ */
  memo: z
    .string()
    .max(500, formatString(MSG_MAX, 'メモ', '500'))
    .optional(),
});
export type UserDetailFormValues = z.infer<typeof UserDetailSchema>;

/**
 * ログイン スキーマ
 */
export const LoginSchema = z.object({
  /* ステータス */
  password: z.string().nonempty({ message: formatString(MSG_REQUIRED, 'パスワード') }),
  /* メモ */
  email: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') })
    .email(formatString(MSG_EMAIL, 'メールアドレス'))
    .max(256, formatString(MSG_MAX, 'メールアドレス', '256')),
});

/**
 * ログイン FormValues
 */
export type LoginFormValues = z.infer<typeof LoginSchema>;

/**
 * スケジュール一覧 検索条件 スキーマ
 */
export const ScheduleSearchSchema = z
  .object({
    /* 配達日(FROM) */
    deliveryFrom: z.union([
      z.null({ message: formatString(MSG_INVALID, '配達日(FROM)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(MSG_INVALID, '配達日(FROM)')
              : formatString(MSG_REQUIRED, '配達日(FROM)'),
        }),
      }),
    ]),
    /* 配達日(TO) */
    deliveryTo: z.union([
      z.null({ message: formatString(MSG_INVALID, '配達日(TO)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(MSG_INVALID, '配達日(TO)')
              : formatString(MSG_REQUIRED, '配達日(TO)'),
        }),
      }),
    ]),
    /* 会社名 */
    company_name: z
      .string()
      .max(64, formatString(MSG_MAX, '会社名', '64'))
      .optional(),
    /* ステータス */
    shop_name: z
      .string()
      .max(64, formatString(MSG_MAX, '店舗名', '64'))
      .optional(),
  }) /* 提供時間 FROM<TOではない */
  .superRefine((data, ctx) => {
    if (!data.deliveryFrom && !data.deliveryTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryFrom'],
        message: 'いずれかの日を入力してください。',
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryTo'],
        message: 'いずれかの日を入力してください。',
      });
    }
    if (data.deliveryFrom && data.deliveryTo) {
      if (data.deliveryFrom > data.deliveryTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['deliveryFrom'],
          message: '開始時間は終了時間より早い時間を設定してください。',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['deliveryTo'],
          message: '終了時間は開始時間より遅い時間を設定してください。',
        });
      }
    }
  });

/**
 * スケジュール一覧 検索条件 FormValues
 */
export type ScheduleSearchFormValues = z.infer<typeof ScheduleSearchSchema>;

/**
 * ユーザー一覧 検索条件 FormValues
 */
export const UserSearchSchema = z.object({
  /* ユーザー名 */
  user_name: z.string().optional(),
  /* 会社名 */
  company_name: z
    .string()
    .max(64, formatString(MSG_MAX, '会社名', '64'))
    .optional(),
  /* 支店名 */
  branch_name: z
    .string()
    .max(64, formatString(MSG_MAX, '会社名', '64'))
    .optional(),
  /* ユーザー利用ステータス */
  user_usage_status: z.union([z.string().optional(), z.nativeEnum(UserUsageStatus)]),
});

/**
 * ユーザー一覧 検索条件 FormValues
 */
export type UserSearchFormValues = z.infer<typeof UserSearchSchema>;

/**
 * オーダー一覧 検索条件 FormValues
 */
export const OrderSearchSchema = z
  .object({
    /* 配達日(FROM) */
    deliveryFrom: z.union([
      z.null({ message: formatString(MSG_INVALID, '配達日(FROM)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(MSG_INVALID, '配達日(FROM)')
              : formatString(MSG_REQUIRED, '配達日(FROM)'),
        }),
      }),
    ]),
    /* 配達日(TO) */
    deliveryTo: z.union([
      z.null({ message: formatString(MSG_INVALID, '配達日(TO)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(MSG_INVALID, '配達日(TO)')
              : formatString(MSG_REQUIRED, '配達日(TO)'),
        }),
      }),
    ]),
    /* ユーザー名 */
    userName: z.string().optional(),
    /* 会社名 */
    companyName: z
      .string()
      .max(64, formatString(MSG_MAX, '会社名', '64'))
      .optional(),
    /* 支店名 */
    branchName: z
      .string()
      .max(64, formatString(MSG_MAX, '会社名', '64'))
      .optional(),
    /* ステータス */
    status: z.string().optional(),
  })
  /* 提供時間 FROM<TOではない */
  .superRefine((data, ctx) => {
    if (!data.deliveryFrom && !data.deliveryTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryFrom'],
        message: 'いずれかの日を入力してください。',
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryTo'],
        message: 'いずれかの日を入力してください。',
      });
    }
    if (data.deliveryFrom && data.deliveryTo) {
      if (data.deliveryFrom > data.deliveryTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['deliveryFrom'],
          message: '開始時間は終了時間より早い時間を設定してください。',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['deliveryTo'],
          message: '終了時間は開始時間より遅い時間を設定してください。',
        });
      }
    }
  });

/**
 * オーダー一覧 検索条件 FormValues
 */
export type OrderSearchFormValues = z.infer<typeof OrderSearchSchema>;
