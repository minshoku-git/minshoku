import { UserUsageStatus } from '@/app/_types/enum';

/* API Request / Response Type
------------------------------------------------------------------ */
export type ApiRequest<T> = {
  request: T;
  sortItems?: SortItems;
};

export type SortItems = {
  nextPage: number;
  sortColumn: string;
  ascending: boolean;
};

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  paginate?: PaginateData;
};

export type PaginateData = {
  count: number | null;
  currentPage: number;
  totalPage: number;
  startRow: number;
  endRow: number;
};

/* Types
------------------------------------------------------------------ */
/** 検索結果 会社一覧 */
export type SearchResult_CompanyList = {
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

/** 検索結果 ユーザー一覧 */
export type SearchResult_UserList = {
  /** ID */
  id: string;
  /** ユーザー名 */
  user_name: string;
  /** ユーザー名カナ */
  user_name_kana: string;
  /** 会社ID */
  t_companies_id: string;
  /** 会社情報 */
  t_companies: {
    /** 会社名 */
    company_name: string;
    /** 支店名 */
    branch_name: string;
  };
  /** ユーザー利用ステータス */
  user_usage_status: string | UserUsageStatus;
};

/** 取得結果 ユーザー詳細 */
export type DetailResult_UserData = {
  /** ID */
  id: string;
  /** ユーザー名 */
  user_name: string;
  /** ユーザー名カナ */
  user_name_kana: string;
  /** 任意項目_回答1 */
  optional_item_answer_1?: string;
  /** 任意項目_回答2 */
  optional_item_answer_2?: string;
  /** メールアドレス */
  user_email?: string;
  /** ユーザー利用ステータス */
  user_usage_status: string | UserUsageStatus;
  /** 利用ステータス */
  usage_status: string | UsageStatus;
  /** メモ（マスタ） */
  master_memo?: string;
  /** 会社情報 */
  t_companies: {
    /** 会社名 */
    company_name: string;
    /** 支店名 */
    branch_name: string;
  };
  /** 部署情報 */
  t_companies_department: {
    /** 部署名 */
    department_name?: string;
  };
  /** 会社雇用形態情報 */
  t_companies_employment_status: {
    /** 雇用形態名 */
    employment_status_name?: string;
  };
};

/** 検索結果 店舗一覧 */
export type SearchResult_ShopList = {
  /** ID */
  id: string;
  /** 店舗名 */
  shop_name?: string;
  /** 郵便番号 */
  shop_post_code?: string;
  /** 住所 */
  address?: string;
  /** 利用ステータス */
  usage_status?: string;
};

/** 検索結果 オーダー一覧 */
export type SearchResult_orderList = {
  /** ID */
  id: string;
  /** 納品日 */
  delivery_day: string;
  /** ユーザー名カナ */
  user_name_kana: string;
  /** 会社名 */
  company_name: string;
  /** 支店名 */
  branch_name: string;
  /** 個数 */
  count: number;
  /** 支払いステータス */
  payment_state: string;
  /** 注文ステータス */
  order_state: string;
};

/** 検索結果 スケジュール一覧 */
export type SearchResult_ScheduleList = {
  /** ID */
  id: string;
  /** 納品日 */
  delivery_day: string;
  /** 会社名 */
  company_name: string;
  /** 支店名 */
  branch_name: string;
  /** 店舗名 */
  shop_name: string;
  /** メニュー名 */
  menu_name: string;
  /** 食数 */
  count: number;
  /** アレルギー */
  allergen_labelling: Array<string>;
};
