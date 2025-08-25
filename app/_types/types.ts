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
