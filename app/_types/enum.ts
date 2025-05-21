/**
 * enum.tsx
 * 全機能共通で使用する区分値を管理します。
 * マジックナンバーは使わないこと！
 */

/** AlertType */
export enum AlertType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
}

/** ソート順 */
export enum SortType {
  ASC = 'asc',
  DESC = 'desc',
}

/** ユーザー利用ステータス */
export enum UserUsageStatus {
  /** 0:制限なし */
  NOLIMIT = '0',
  /** 1:申請中 */
  PENDING = '1',
  /** 2:利用停止 */
  DEACTIVATION = '2',
  /** 3:否認 */
  DISAPPROVAL = '3',
  /** 4:削除 */
  DELETE = '4',
  /** 5:登録中 */
  REGISTERED = '5',
}

/* 利用制限ステータス */
export enum UsageRestrictionsStatus {
  AVAILABLE = '0', // 利用可能
  DEACTIVATION = '1', // 利用停止
}

/* 会社利用ステータス(契約ステータス？) */
export enum CompaniesUsageStatus {
  AVAILABLE = '0', // 利用可能
  DEACTIVATION = '1', // 利用停止
}

/* 支払いステータス */
export enum PaymentStatus {
  /** 0:会社清算 */
  SALAEY_DEDUCTIONS = '0',
  /** 1:クレジットカード */
  CREDITCARD = '1',
  /** 2:PayPay */
  PAYPAY = '2',
}

/** オーダーステータス */
export enum OrderStatus {
  /** 0:制限なし */
  CANCEL = '0',
  /** 1:有効 */
  VALID = '1',
}
