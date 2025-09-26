/** ユーザーテーブル */
export type t_user = {
  /** ID（ユーザーID） */
  id?: number;
  /** 企業ID */
  t_companies_id?: number;
  /** 企業部署ID */
  t_companies_department_id?: number;
  /** 企業雇用形態ID */
  t_companies_employment_status_id?: number;
  /** ユーザー名 */
  user_name?: string;
  /** ユーザー名カナ */
  user_name_kana?: string;
  /** 任意項目_回答1 */
  optional_item_answer_1?: string;
  /** 任意項目_回答2 */
  optional_item_answer_2?: string;
  /** ユーザー登録ステータス */
  user_registration_status?: string;
  /** 利用ステータス */
  usage_status?: string;
  /** メールアドレス */
  user_email?: string;
  /** パスワード */
  signup_password?: string;
  /** 支払種別 */
  payment_type?: string;
  /** メモ（マスタ） */
  master_memo?: string;
  /** クレジット_メンバーID */
  credit_member_id?: string;
  /** クレジット連番 */
  credit_seq_choice?: string;
  /** urlキー */
  url_key?: string;
  /** 登録日時 */
  created_at?: DATE;
  /** 更新日時 */
  updated_at?: DATE;
};

/** 会社テーブル */
export type t_companies = {
  /** ID */
  id?: number;
  /** 会社名 */
  company_name?: string;
  /** 支店名 */
  branch_name?: string;
  /** 食堂名 */
  restaurant_name?: string;
  /** 郵便番号 */
  postal_code?: string;
  /** 都道府県 */
  address?: string;
  /** 番地 */
  area_block_number?: string;
  /** 建物名 */
  building_name?: string;
  /** メールアドレス */
  email?: string;
  /** メモ */
  memo?: string;
  /** ドメイン */
  domain: Array<string>;
  /** 提供場所 */
  location?: string;
  /** 提供時間_From */
  offer_time_from?: string;
  /** 提供時間_To */
  offer_time_to?: string;
  /** 注文期限_日 */
  order_period_day?: number;
  /** 注文期限_時間 */
  order_period_time?: string;
  /** キャンセル期限_日 */
  cancel_period_day?: number;
  /** キャンセル期限_時間 */
  cancel_period_time?: string;
  /** 任意項目_項目名1 */
  optional_item_title_1?: string;
  /** 任意項目_注釈1 */
  optional_item_notes_1?: string;
  /** 任意項目_項目名2 */
  optional_item_title_2?: string;
  /** 任意項目_注釈2 */
  optional_item_notes_2?: string;
  /** urlキー */
  url_key?: string;
  /** 利用ステータス */
  usage_status: string;
  /** 登録日時 */
  created_at?: Date;
  /** 更新日時 */
  updated_at?: Date;
};

/** 店舗テーブル */
export type t_shops = {
  /** id */
  id?: number;
  /** 店舗名 */
  shop_name?: string;
  /** 店舗名かな */
  shop_name_kana?: string;
  /** 郵便番号 */
  shop_postal_code?: string;
  /** 住所 */
  shop_address?: string;
  /** 番地 */
  shop_area_block_number?: string;
  /** 建物名 */
  shop_building_name?: string;
  /** 電話番号 */
  tel_no?: string;
  /** メールアドレス */
  email?: string;
  /** 特定商取引法に基づく表記 */
  specified_commercial_transaction_act?: string;
  /** 店舗イメージ_ファイル名 */
  shop_image_file_name?: string;
  /** 店舗イメージ_ファイルサイズ(byte) */
  shop_image_file_bytesize?: number;
  /** 店舗イメージ_セーフファイル名 */
  shop_image_safe_file_name?: string;
  /** 食べログURL */
  tabelog_url?: string;
  /** 店舗紹介文 */
  shop_description?: string;
  /** 店舗利用制限ステータス */
  usage_status?: string;
  /** gmoショップコード */
  gmo_shop_code?: string;
  /** gmoショップパスワード */
  gmo_shop_password?: string;
  /** メモ */
  memo?: string;
  /** 登録日時 */
  created_at?: Date;
  /** 更新日時 */
  updated_at?: Date;
};

/** 注文テーブル */
export type t_order = {
  /** ID(注文ID) */
  id?: number;
  /** 店舗ID */
  t_shops_id?: number;
  /** 企業ID */
  t_companies_id?: number;
  /** ユーザーID */
  t_user_id?: number;
  /** スケジュールID */
  t_menu_schedule_id?: number;
  /** 企業部署ID */
  t_companies_department_id?: number;
  /** 企業雇用形態ID */
  t_companies_employment_status_id?: number;
  /** 注文日時 */
  order_datetime?: Date;
  /** 納品日 */
  delivery_day?: Date;
  /** 個数 */
  count?: number;
  /** 単価 */
  list_price?: number;
  /** 総額 */
  amount?: number;
  /** 企業負担額 */
  companies_burden_amount?: number;
  /** 個人負担額 */
  user_burden_amount?: number;
  /** 支払い種別 */
  payment_type?: string;
  /** オーダーステータス */
  order_status_type?: string;
  /** キャンセル日時 */
  cancel_datetime?: Date;
  /** クレジット取引ID */
  credit_access_id?: string;
  /** クレジット取引パスワード */
  credit_access_password?: string;
  /** GMOオーダーID */
  gmo_order_id?: string;
  /** PayPay取引ID */
  paypay_access_id?: string;
  /** PayPay取引パスワード */
  paypay_access_password?: string;
  /** 登録日時 */
  created_at?: Date;
  /** 更新日時 */
  updated_at?: Date;
};

/** 企業部署情報テーブル */
export type t_companies_department = {
  /** ID（メニュースケジュールID） */
  id?: number;
  /** 企業ID */
  t_companies_id?: number;
  /** 部署名 */
  department_name?: string;
  /** 削除フラグ 0:有効/1:削除 */
  delete_flag?: string;
  /** 登録日時 */
  created_at?: DATE;
  /** 更新日時 */
  updated_at?: DATE;
};

/** 企業雇用形態テーブル */
export type t_companies_employment_status = {
  /** ID（企業雇用形態ID） */
  id?: number;
  /** 企業ID */
  t_companies_id?: number;
  /** 雇用形態名 */
  employment_status_name?: string;
  /** 負担額 */
  set_meal_burden?: number;
  /** 削除フラグ ※0:有効/1:削除 */
  delete_flag?: string;
  /** 給与天引きFlag ※0:非/1:可 */
  deduction_flag?: string;
  /** クレジットカードFlag ※0:非/1:可 */
  credit_flag?: string;
  /** PaypayFlag ※0:非/1:可 */
  paypay_flag?: string;
  /** 登録日時 */
  created_at?: DATE;
  /** 更新日時 */
  updated_at?: DATE;
};

/** 会社ドメインテーブル */
export type t_companies_domain = {
  /** ID（会社ドメインID） */
  id?: number;
  /** 会社ID */
  t_companies_id?: number;
  /** ドメイン名 */
  domain_name?: string;
  /** 登録日時 */
  created_at?: date;
  /** 更新日時 */
  updated_at?: date;
};

/** 企業部署情報テーブル */
export type t_administrator = {
  /** ID */
  id?: string;
  /** 名前 */
  name?: string;
  /** メールアドレス */
  email?: string;
  /** 利用ステータス */
  usage_state?: string;
};

/** スケジュールテーブル */
export type t_menu_schedule = {
  /** ID */
  id?: number;
  /** 店舗ID */
  t_shops_id?: number;
  /** 会社ID */
  t_companies_id?: number;
  /** 納品日 */
  delivery_day?: Date;
  /** メニュー名 */
  menu_name?: string;
  /** メニュー紹介 */
  menu_description?: string;
  /** アレルギー表記 */
  allergen_labelling?: string;
  /** 辛さレベル */
  spice_level?: number;
  /** 在庫数 */
  stock_count?: number;
  /** 単価 */
  list_price?: number;
  /** 売価 */
  sale_price?: number;
  /** キャンセルフラグ */
  cancel_flag?: string;
  /** 登録日時 */
  created_at?: date;
  /** 更新日時 */
  updated_at?: date;
};

/** 問い合わせテーブル */
export type t_contact = {
  /** ID（ユーザーID） */
  id?: number;
  /** 企業ID */
  t_companies_id?: number;
  /** 企業部署ID */
  t_companies_department_id?: number;
  /** 企業雇用形態ID */
  t_companies_employment_status_id?: number;
  /** ユーザーID */
  t_user_id?: number;
  /** 問い合わせ内容 */
  contact_message?: string;
  /** 登録日時 */
  created_at?: date;
  /** 更新日時 */
  updated_at?: date;
};
