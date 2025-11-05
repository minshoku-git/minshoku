import { SortType } from './enum';

/**
 * types.tsx
 * 全機能共通で使用する型定義を管理します。
 * なるべくココで定義すること！
 */

/* 検索結果 テーブルヘッダー
------------------------------------------------------------------ */
export type HeaderStatus = {
  // ヘッダー名
  name: string;
  // 変数名
  variableName: string;
  // ソートタイプ
  sort: SortType;
};

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

export type PaginateData = {
  count: number;
  currentPage: number;
  totalPage: number;
  startRow: number;
  endRow: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  paginate?: PaginateData;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    status?: number;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/* Mui 専用型定義
------------------------------------------------------------------ */
/** SelectOption */
export type SelectOption = {
  /** ID */
  id: string;
  /** ラベル */
  label: string;
};

/* 汎用型定義
------------------------------------------------------------------ */
/**
 * 仮登録完了
 */
export type SignUpEncrypt = {
  /** ユーザーID */
  id: number;
};

/**
 * 部署情報 DepartmentData
 */
export type DepartmentData = {
  // 部署ID
  id: string;
  // 部署名
  name: string;
  // 編集不可 ※true:編集不可(非活性),false:編集可能(活性)
  disabled: boolean;
  // 削除フラグ ※true:削除/false:有効
  delete_flag: boolean;
};

/**
 * 雇用種別情報 DepartmentData
 */
export type EmploymentData = {
  // 雇用種別ID
  id: string;
  // 雇用種別名
  employment_status_name: string;
  // 決済方法(控除)
  deduction_flag: boolean;
  // 決済方法(クレジットカード)
  credit_flag: boolean;
  // 決済方法(PayPay)
  paypay_flag: boolean;
  // 会社負担
  set_meal_burden: string;
  // 編集不可 ※true:編集不可(非活性),false:編集可能(活性)
  disabled: boolean;
  // 削除フラグ ※true:削除/false:有効
  delete_flag: boolean;
};
