/** ユーザーテーブル */
export type t_user = {
  /** ユーザー名 */
  user_name?: string;
  company_name?: string;
};

/** 企業テーブル */
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
  post_code?: string;
  /** 都道府県 */
  prefectures?: string;
  /** 市区 */
  municipalities?: string;
  /** 町村 */
  town_area?: string;
  /** 番地 */
  area_block_number?: string;
  /** 建物名 */
  building_name?: string;
  /** 提供場所(設計書未追加) */
  location?: string;
  /** メールアドレス */
  mailaddress?: string;
  /** メモ */
  memo?: string;
  /** 利用ステータス */
  usage_state?: number;
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
  /** 提供時間_From */
  offer_time_from?: string;
  /** 提供時間_To */
  offer_time_to?: string;
  /** 注文期限_Day */
  order_period_day?: number;
  /** 注文期限_時 */
  order_period_hour?: number;
  /** 注文期限_分 */
  order_period_minute?: number;
  /** キャンセル期限_Day */
  cancel_period_day?: number;
  /** キャンセル期限_時 */
  cancel_period_hour?: number;
  /** キャンセル期限_分 */
  cancel_period_minute?: number;
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
  shop_post_code?: string;
  /** 都道府県 */
  shop_prefectures?: string;
  /** 市区 */
  shop_municipalities?: string;
  /** 町村 */
  shop_town_area?: string;
  /** 番地 */
  shop_area_block_number?: string;
  /** 建物名 */
  shop_building_name?: string;
  /** 電話番号 */
  tel_no?: string;
  /** メールアドレス */
  mailaddress?: string;
  /** 特定商取引法に基づく表記 */
  specified_commercial_transaction_act?: string;
  /** 店舗イメージ */
  shop_image?: string;
  /** 利用ステータス */
  usage_state?: number;
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
  /** 定番スケジュールID */
  t_menu_schedule_id?: number;
  /** 注文日時 */
  order_datetime?: Date;
  /** 納品日 */
  delivery_day?: Date;
  /** 個数 */
  count?: number;
  /** 単価 */
  unit_price?: number;
  /** 総額 */
  amount?: number;
  /** 企業負担額 */
  companies_burden_amount?: number;
  /** 個人負担額 */
  user_burden_amount?: number;
  /** 支払いステータス */
  payment_state?: number;
  /** オーダーステータス */
  order_state?: number;
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

/** スケジュールテーブル */
export type t_menu_schedule_classic = {
  /** ID（メニュースケジュールID） */
  id?: number;
  /** 店舗ID */
  t_shops_id?: number;
  /** 企業ID */
  t_companies_id?: number;
  /** 納品日 */
  delivery_day?: DATE;
  /** メニュー名 */
  nenu_name?: string;
  /** アレルギー表記 */
  allergies?: Array<string>;
  /** 在庫数 */
  stock_count?: number;
  /** 注文数 */
  order_count?: number;
  /** 単価 */
  unit_price?: number;
  /** キャンセルフラグ */
  cancel_flag?: 0;
  /** 登録日時 */
  created_at?: DATE;
  /** 更新日時 */
  updated_at?: DATE;
};

/** 企業部署情報テーブル */
export type t_companies_department = {
  /** ID（メニュースケジュールID） */
  id?: number;
  /** 企業ID */
  t_companies_id?: number;
  /** 部署名 */
  department_name?: string;
  /** 表示順 */
  display_order?: number;
  /** 削除フラグ 0:有効/1:削除 */
  delete_flag?: number;
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
  /** 表示順 */
  display_order?: number;
  /** 負担額 */
  set_meal_burden?: number;
  /** 削除フラグ ※0:有効/1:削除 */
  delete_flag?: number;
  /** 給与天引きFlag ※0:非/1:可 */
  deduction_flag?: number;
  /** クレジットカードFlag ※0:非/1:可 */
  credit_flag?: number;
  /** PaypayFlag ※0:非/1:可 */
  paypay_flag?: number;
  /** 登録日時 */
  created_at?: DATE;
  /** 更新日時 */
  updated_at?: DATE;
};
