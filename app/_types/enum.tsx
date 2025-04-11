/**
 * enum.tsx
 * 全機能共通で使用する区分値を管理します。
 * マジックナンバーは使わないこと！
 */

// AlertType
export enum AlertType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
}

/* ソート順 */
export enum SortType {
  ASC = 'asc',
  DESC = 'desc',
}

/* ユーザー利用ステータス */
export enum UserUsageStatus {
  NOLIMIT = '00', // 制限なし
  PENDING = '01', // 申請中
  DEACTIVATION = '02', // 利用停止
  DISAPPROVAL = '03', // 否認
  DELETE = '04', // 削除
  REGISTERED = '05', // 登録中
}

/* 利用制限ステータス */
export enum UsageRestrictionsStatus {
  AVAILABLE = '00', // 利用可能
  DEACTIVATION = '01', // 利用停止
}

/* 企業利用ステータス(契約ステータス？) */
export enum UsageCompanyStatus {
  USING = '00', // 利用中
  DEACTIVATION = '01', // 利用停止
}
