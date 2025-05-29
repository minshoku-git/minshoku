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
