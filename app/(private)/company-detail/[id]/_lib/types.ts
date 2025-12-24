import { z } from 'zod';

import {
  MSG_DOMAIN,
  MSG_EMAIL,
  MSG_HANKAKU_NUM,
  MSG_INVALID,
  MSG_MAX,
  MSG_POSTALCODE,
  MSG_REQUIRED,
  REG_DOMAIN,
  REG_HANKAKU_NUM,
} from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';
import { UsageStatus } from '@/app/_types/enum';

/**
 * 初期表示 入力用バリデーションスキーマ
 */
export const CompanyDetailInitSchema = z.object({
  id: z.number(),
});
/**
 * 初期表示 API用バリデーションスキーマ
 */
export const CompanyDetailInitApiSchema = z
  .object({
    request: CompanyDetailInitSchema,
  })
  .strict();
// 初期表示 FormValues
export type CompanyDetailInitValues = z.infer<typeof CompanyDetailInitSchema>;

/**
 * 会社登録更新 入力用バリデーションスキーマ
 */
export const CompanyDetailSchema = z
  .object({
    id: z.string().optional(),
    /** 会社名 */
    company_name: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '会社名') })
      .max(64, formatString(MSG_MAX, '会社名', '64')),
    /** 支店名 */
    branch_name: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '支店名') })
      .max(256, formatString(MSG_MAX, '支店名', '256')),
    /** 食堂名 */
    restaurant_name: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '食堂名') })
      .max(256, formatString(MSG_MAX, '食堂名', '256')),
    /** 郵便番号(前半) */
    postal_code_prefix: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '郵便番号') })
      .min(3, formatString(MSG_MAX, '郵便番号', '3'))
      .regex(new RegExp(REG_HANKAKU_NUM), formatString(MSG_POSTALCODE, '郵便番号', '3')),
    /** 郵便番号(後半) */
    postal_code_suffix: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '郵便番号') })
      .min(4, formatString(MSG_MAX, '郵便番号', '4'))
      .regex(new RegExp(REG_HANKAKU_NUM), formatString(MSG_POSTALCODE, '郵便番号', '4')),
    /** 都道府県 */
    address: z.string().nonempty({ message: formatString(MSG_REQUIRED, '住所') }),
    /** 番地 */
    area_block_number: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '番地') })
      .max(128, formatString(MSG_MAX, '番地', '128')),
    /** 建物名 */
    building_name: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '建物名') })
      .max(128, formatString(MSG_MAX, '建物名', '128')),
    /** メールアドレス */
    email: z
      .email(formatString(MSG_EMAIL, 'メールアドレス'))
      .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') }),
    /** 連絡先・メモ */
    memo: z.string().optional(),
    /** 部署情報(Array) */
    departmentInfo: z
      .object({
        /** 部署ID */
        id: z.string(),
        /** 部署名 */
        name: z.string().nonempty({ message: formatString(MSG_REQUIRED, '部署情報') }),
        /** 編集不可 ※true:編集不可(非活性)/false:編集可能(活性) */
        disabled: z.boolean(),
        /** 削除フラグ ※true:削除/false:有効 */
        delete_flag: z.boolean(),
      })
      .array(),
    /** 雇用種別情報(Array) */
    employmentStatusInfo: z
      .object({
        /** 雇用種別ID */
        id: z.string(),
        /** 雇用種別名 */
        employment_status_name: z.string(),
        /** 決済方法(控除) */
        deduction_flag: z.boolean(),
        /** 決済方法(クレジットカード) */
        credit_flag: z.boolean(),
        /** 決済方法(PayPay) */
        paypay_flag: z.boolean(),
        /** 会社負担 */
        set_meal_burden: z.string(),
        /** 編集不可 true:編集不可(非活性),false:編集可能(活性) */
        disabled: z.boolean(),
        /** 削除フラグ ※true:削除/false:有効 */
        delete_flag: z.boolean(),
      })
      .array(),
    /** ドメイン(Array) */
    domain: z
      .object({
        /** ドメイン */
        id: z.string(),
        /** ドメイン */
        name: z
          .string()
          .nonempty({ message: formatString(MSG_REQUIRED, 'ドメイン') })
          .regex(new RegExp(REG_DOMAIN), formatString(MSG_DOMAIN)),
        /** 編集不可 ※true:編集不可(非活性)/false:編集可能(活性) */
        disabled: z.boolean(),
        /** 削除フラグ ※true:削除/false:有効 */
        delete_flag: z.boolean(),
      })
      .array(),
    /** 提供場所 */
    location: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '提供場所') })
      .max(128, formatString(MSG_MAX, '提供場所', '128')),

    /** 提供時間(FROM) */
    offer_time_from: z.date().refine((val) => val && !isNaN(val.getTime()), {
      message: formatString(MSG_INVALID, '開始時間'),
    }),
    /** 提供時間(TO) */
    offer_time_to: z.date().refine((val) => val && !isNaN(val.getTime()), {
      message: formatString(MSG_INVALID, '終了時間'),
    }),
    /** 注文期限(日付) */
    order_period_day: z.string().nonempty({ message: formatString(MSG_REQUIRED, '日') }),
    /** 注文期限(時間) */
    order_period_time: z.date().refine((val) => val && !isNaN(val.getTime()), {
      message: formatString(MSG_INVALID, '時間'),
    }),
    /** キャンセル期限(日付) */
    cancel_period_day: z.string().nonempty({ message: formatString(MSG_REQUIRED, '日') }),
    /** キャンセル期限(時間) */
    cancel_period_time: z.date().refine((val) => val && !isNaN(val.getTime()), {
      message: formatString(MSG_INVALID, '時間'),
    }),
    /** 任意項目1(項目名) */
    optional_item_title_1: z.string().optional(),
    /** 任意項目1(注釈) */
    optional_item_notes_1: z.string().optional(),
    /** 任意項目1(項目名) */
    optional_item_title_2: z.string().optional(),
    /** 任意項目1(注釈) */
    optional_item_notes_2: z.string().optional(),
    /** 利用ステータス */
    usage_status: z.nativeEnum(UsageStatus),
  })
  /** カスタムバリデーション
  ------------------------------------------------------------------ */
  /** 部署情報 部署名の重複 */
  .check((ctx) => {
    ctx.value.departmentInfo.forEach((item, index) => {
      const filterLength = ctx.value.departmentInfo.filter((f) => f.name === item.name).length;
      if (filterLength > 1) {
        ctx.issues.push({
          code: 'custom',
          path: [`departmentInfo.${index}.name`],
          message: '部署名が重複しています。',
          input: ctx.value,
        });
      }
    });
  })
  /** 雇用種別情報 雇用形態名の重複 */
  .check((ctx) => {
    ctx.value.employmentStatusInfo.forEach((item, index) => {
      const filterLength = ctx.value.employmentStatusInfo.filter(
        (f) => f.employment_status_name === item.employment_status_name
      ).length;
      if (filterLength > 1) {
        ctx.issues.push({
          code: 'custom',
          path: [`employmentStatusInfo.${index}.employment_status_name`],
          message: '雇用形態名が重複しています。',
          input: ctx.value,
        });
      }
    });
  })
  /** 雇用種別情報 チェックボックスがすべてOFFはOUT */
  .check((ctx) => {
    ctx.value.employmentStatusInfo.forEach((e, index) => {
      if (!e.employment_status_name && (e.deduction_flag || e.credit_flag || e.paypay_flag)) {
        ctx.issues.push({
          code: 'custom',
          path: [`employmentStatusInfo.${index}.employment_status_name`],
          message: formatString(MSG_REQUIRED, '雇用形態名'),
          input: ctx.value,
        });
      }
      if (e.employment_status_name && !e.deduction_flag && !e.credit_flag && !e.paypay_flag) {
        // チェックボックスではメッセージが収まらないので、業務形態名で表示
        ctx.issues.push({
          code: 'custom',
          path: [`employmentStatusInfo.${index}.employment_status_name`],
          message: '決済方法を1つ以上選択してください。',
          input: ctx.value,
        });
        ctx.issues.push({
          code: 'custom',
          path: [`employmentStatusInfo.${index}.deduction_flag`],
          message: '',
          input: ctx.value,
        });
        ctx.issues.push({
          code: 'custom',
          path: [`employmentStatusInfo.${index}.credit_flag`],
          message: '',
          input: ctx.value,
        });
        ctx.issues.push({
          code: 'custom',
          path: [`employmentStatusInfo.${index}.paypay_flag`],
          message: '',
          input: ctx.value,
        });
      }
      const regex1 = new RegExp(REG_HANKAKU_NUM);
      if (!regex1.test(e.set_meal_burden)) {
        ctx.issues.push({
          code: 'custom',
          path: [`employmentStatusInfo.${index}.set_meal_burden`],
          message: formatString(MSG_HANKAKU_NUM, '会社負担額'),
          input: ctx.value,
        });
      }
    });
  })
  /** ドメイン ドメインの重複 */
  .check((ctx) => {
    ctx.value.domain.forEach((item, index) => {
      const filterLength = ctx.value.domain.filter((f) => f.name === item.name).length;
      if (filterLength > 1) {
        ctx.issues.push({
          code: 'custom',
          path: [`domain.${index}.name`],
          message: 'ドメインが重複しています。',
          input: ctx.value,
        });
      }
    });
  })
  /** 提供時間 FROM<TOではない */
  .check((ctx) => {
    if (ctx.value.offer_time_from && ctx.value.offer_time_to) {
      if (ctx.value.offer_time_from >= ctx.value.offer_time_to) {
        ctx.issues.push({
          code: 'custom',
          path: ['offer_time_from'],
          message: '開始時間は終了時間より早い時間を設定してください。',
          input: ctx.value,
        });
        ctx.issues.push({
          code: 'custom',
          path: ['offer_time_to'],
          message: '終了時間は開始時間より遅い時間を設定してください。',
          input: ctx.value,
        });
      }
    }
  })
  /** 任意項目1 注釈のみの入力はOUT */
  .refine((data) => !(data.optional_item_title_1 === '' && data.optional_item_notes_1 !== ''), {
    path: ['optional_item_title_1'],
    message: '項目名を入力してください。',
  })
  /** 任意項目2 注釈のみの入力はOUT */
  .refine((data) => !(data.optional_item_title_2 === '' && data.optional_item_notes_2 !== ''), {
    path: ['optional_item_title_2'],
    message: '項目名を入力してください。',
  })
  .strict();
/**
 * 会社新規登録・会社更新 API用バリデーションスキーマ
 */
export const CompanyDetailApiSchema = z
  .object({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: z.preprocess((val: any) => {
      if (!val) return val;
      // 日付文字列を Date オブジェクトに変換して、内側のスキーマに渡す
      return {
        ...val,
        offer_time_from: val.offer_time_from ? new Date(val.offer_time_from) : val.offer_time_from,
        offer_time_to: val.offer_time_to ? new Date(val.offer_time_to) : val.offer_time_to,
        order_period_time: val.order_period_time ? new Date(val.order_period_time) : val.order_period_time,
        cancel_period_time: val.cancel_period_time ? new Date(val.cancel_period_time) : val.cancel_period_time,
      };
    }, CompanyDetailSchema),
  })
  .strict();
/**
 * 会社新規登録・会社更新 FormValues
 */
export type CompanyDetailFormValues = z.infer<typeof CompanyDetailSchema>;

/** 取得結果 会社詳細 */
export type CompanyDetailResult = {
  /** ユーザー登録URL */
  url: string;
} & CompanyDetailFormValues;

/**
 * ユーザー基本情報 復号後
 */
export type CompanyDetailToken = {
  /** 会IDD */
  t_companies_id: number;
};
