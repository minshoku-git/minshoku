/**
 * enum.tsx
 * 全機能共通で使用する区分値を管理します。
 * マジックナンバーは使わないこと！
 */

// AlertTypeをEnumとして定義
export enum AlertType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
}

// AlertTypeをEnumとして定義
export enum SortType {
  ASC = 'asc',
  DESC = 'desc',
}
