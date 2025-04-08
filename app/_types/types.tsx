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

function formatString(template: string, ...args: (string | number)[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return index < args.length ? String(args[index]) : match;
  });
}

const required_msg = '{0}は必須入力です。';
const invalid_msg = '{0}を正しく入力してください。';
const max_msg = '{0}は{1}文字以内で入力してください。';
const mail_msg = '{0}は正しく入力してください。';
const number_msg = '{0}は半角数字を入力してください。';
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
export const CompanyDetailSchema = z
  .object({
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
    /* 部署情報(Array) */
    departmentInfo: z
      .object({
        /* 部署ID */
        id: z.string().optional(),
        /* 部署名 */
        name: z.string().optional(),
        /* 編集不可 true:編集不可(非活性),false:編集可能(活性) */
        disabled: z.boolean(),
      })
      .array(),
    /* 雇用種別情報(Array) */
    employmentTypeInfo: z
      .object({
        /* 雇用種別ID */
        id: z.string().optional(),
        /* 雇用種別名 */
        name: z.string().optional(),
        /* 決済方法(控除) */
        isDeduction: z.boolean(),
        /* 決済方法(クレジットカード) */
        isCreditCard: z.boolean(),
        /* 決済方法(PayPay) */
        isPayPay: z.boolean(),
        /* 会社負担 */
        burdenAmount: z
          .string()
          .nonempty({ message: formatString(required_msg, '会社負担') })
          .regex(/^[0-9]+$/, '会社負担は半角数字で入力してください'),
        /* 編集不可 true:編集不可(非活性),false:編集可能(活性) */
        disabled: z.boolean(),
      })
      .array(),
    /* 任意項目1(項目名) */
    anyItem1: z.string().optional(),
    /* 任意項目1(注釈) */
    annotation1: z.string().optional(),
    /* 任意項目1(項目名) */
    anyItem2: z.string().optional(),
    /* 任意項目1(注釈) */
    annotation2: z.string().optional(),
    /* 提供時間(FROM) */
    availabilityFrom: z.union([
      z.null({ message: formatString(invalid_msg, '開始時間') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(invalid_msg, '開始時間')
              : formatString(required_msg, '開始時間'),
        }),
      }),
    ]),
    /* 提供時間(TO) */
    availabilityTo: z.union([
      z.null({ message: formatString(invalid_msg, '終了時間') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(invalid_msg, '終了時間')
              : formatString(required_msg, '終了時間'),
        }),
      }),
    ]),
    /* 注文期限(日付) */
    orderDeadlineDay: z.string().nonempty({ message: formatString(required_msg, '日') }),
    /* 注文期限(時) */
    orderDeadlineHour: z.string().nonempty({ message: formatString(required_msg, '時') }),
    /* 注文期限(分) */
    orderDeadlineMin: z.string().nonempty({ message: formatString(required_msg, '分') }),
    /* キャンセル期限(日付) */
    cancelDeadlineDay: z.string().nonempty({ message: formatString(required_msg, '日') }),
    /* キャンセル期限(時間) */
    cancelDeadlineHour: z.string().nonempty({ message: formatString(required_msg, '時') }),
    /* キャンセル期限(分) */
    cancelDeadlineMin: z.string().nonempty({ message: formatString(required_msg, '分') }),
  })
  /* カスタムバリデーション
  ------------------------------------------------------------------ */
  .refine((data) => data.availabilityFrom, {
    path: ['availabilityFrom'],
    message: formatString(required_msg, '開始時間'),
  })
  .refine((data) => data.availabilityTo, {
    path: ['availabilityTo'],
    message: formatString(required_msg, '終了時間'),
  })
  /* 任意項目1 注釈のみの入力はOUT */
  .refine((data) => !(data.anyItem1 === '' && data.annotation1 !== ''), {
    path: ['anyItem1'],
    message: '項目名を入力してください',
  })
  /* 任意項目2 注釈のみの入力はOUT */
  .refine((data) => !(data.anyItem2 === '' && data.annotation2 !== ''), {
    path: ['anyItem2'],
    message: '項目名を入力してください',
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
    data.employmentTypeInfo.forEach((item, index) => {
      const filterLength = data.employmentTypeInfo.filter((f) => f.name === item.name).length;
      if (filterLength > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentTypeInfo.${index}.name`],
          message: '雇用形態名が重複しています。',
        });
      }
    });
  })
  /* 雇用種別情報 チェックボックスがすべてOFFはOUT */
  .superRefine((data, ctx) => {
    data.employmentTypeInfo.forEach((e, index) => {
      if (!e.name && (e.isDeduction || e.isCreditCard || e.isPayPay)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentTypeInfo.${index}.name`],
          message: formatString(required_msg, '雇用形態名'),
        });
      }
      if (e.name && !e.isDeduction && !e.isCreditCard && !e.isPayPay) {
        // チェックボックスにメッセージが収まらないので、業務形態名で出します！
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentTypeInfo.${index}.name`],
          message: '決済方法を1つ以上選択してください',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentTypeInfo.${index}.isDeduction`],
          message: '',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentTypeInfo.${index}.isCreditCard`],
          message: '',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`employmentTypeInfo.${index}.isPayPay`],
          message: '',
        });
      }
    });
  })
  /* 提供時間 FROM<TOではない */
  .superRefine((data, ctx) => {
    if (data.availabilityFrom && data.availabilityTo) {
      if (data.availabilityFrom >= data.availabilityTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['availabilityFrom'],
          message: '開始時間は終了時間より早い時間を設定してください。',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['availabilityTo'],
          message: '終了時間は開始時間より遅い時間を設定してください。',
        });
      }
    }
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

/* ログイン */
export const LoginSchema = z.object({
  /* ステータス */
  password: z.string().nonempty({ message: formatString(required_msg, 'パスワード') }),
  /* メモ */
  email: z
    .string()
    .trim()
    .nonempty({ message: formatString(required_msg, 'メールアドレス') })
    .email(formatString(mail_msg, 'メールアドレス'))
    .max(256, formatString(max_msg, 'メールアドレス', '256')),
});
export type LoginFormValues = z.infer<typeof LoginSchema>;

/* スケジュール一覧 */
export const ScheduleSearchSchema = z
  .object({
    /* 配達日(FROM) */
    deliveryFrom: z.union([
      z.null({ message: formatString(invalid_msg, '配達日(FROM)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(invalid_msg, '配達日(FROM)')
              : formatString(required_msg, '配達日(FROM)'),
        }),
      }),
    ]),
    /* 配達日(TO) */
    deliveryTo: z.union([
      z.null({ message: formatString(invalid_msg, '配達日(TO)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(invalid_msg, '配達日(TO)')
              : formatString(required_msg, '配達日(TO)'),
        }),
      }),
    ]),
    /* 会社名 */
    companyName: z
      .string()
      .max(64, formatString(max_msg, '会社名', '64'))
      .optional(),
    /* ステータス */
    shopName: z
      .string()
      .max(64, formatString(max_msg, '店舗名', '64'))
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
export type ScheduleSearchFormValues = z.infer<typeof ScheduleSearchSchema>;

/**
 * ユーザー一覧 検索条件 FormValues
 */
export const UserSearchSchema = z.object({
  /* ユーザー名 */
  userName: z.string().optional(),
  /* 会社名 */
  companyName: z
    .string()
    .max(64, formatString(max_msg, '会社名', '64'))
    .optional(),
  /* ステータス */
  status: z.string().optional(),
});
/**
 * ユーザー一覧 検索条件 FormValues
 */
export type UserSearchFormValues = z.infer<typeof UserSearchSchema>;

/**
 * 会社一覧 検索条件 スキーマ
 */
export const CompanySearchSchema = z
  .object({
    /* 配達日(FROM) */
    deliveryFrom: z.union([
      z.null({ message: formatString(invalid_msg, '配達日(FROM)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(invalid_msg, '配達日(FROM)')
              : formatString(required_msg, '配達日(FROM)'),
        }),
      }),
    ]),
    /* 配達日(TO) */
    deliveryTo: z.union([
      z.null({ message: formatString(invalid_msg, '配達日(TO)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(invalid_msg, '配達日(TO)')
              : formatString(required_msg, '配達日(TO)'),
        }),
      }),
    ]),
    /* ユーザー名 */
    userName: z.string().optional(),
    /* 会社名 */
    companyName: z
      .string()
      .max(64, formatString(max_msg, '会社名', '64'))
      .optional(),
    /* 支店名 */
    branchName: z
      .string()
      .max(64, formatString(max_msg, '会社名', '64'))
      .optional(),
    /* ステータス */
    status: z.string().optional(),
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
 * 会社一覧 検索条件 FormValues
 */
export type CompanySearchFormValues = z.infer<typeof CompanySearchSchema>;

/**
 * オーダー一覧 検索条件 FormValues
 */
export const OrderSearchSchema = z
  .object({
    /* 配達日(FROM) */
    deliveryFrom: z.union([
      z.null({ message: formatString(invalid_msg, '配達日(FROM)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(invalid_msg, '配達日(FROM)')
              : formatString(required_msg, '配達日(FROM)'),
        }),
      }),
    ]),
    /* 配達日(TO) */
    deliveryTo: z.union([
      z.null({ message: formatString(invalid_msg, '配達日(TO)') }),
      z.date({
        errorMap: (issue, {}) => ({
          message:
            issue.code === 'invalid_date'
              ? formatString(invalid_msg, '配達日(TO)')
              : formatString(required_msg, '配達日(TO)'),
        }),
      }),
    ]),
    /* ユーザー名 */
    userName: z.string().optional(),
    /* 会社名 */
    companyName: z
      .string()
      .max(64, formatString(max_msg, '会社名', '64'))
      .optional(),
    /* 支店名 */
    branchName: z
      .string()
      .max(64, formatString(max_msg, '会社名', '64'))
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
