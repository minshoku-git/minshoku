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

/**
 * ユーザー利用ステータスの論理名を取得します。
 * @param {UserUsageStatus} value - 締め切り番号
 * @returns {string} - 論理名
 */
export const convertUserUsageStatusName = (value: UserUsageStatus): string => {
  switch (value) {
    case UserUsageStatus.NOLIMIT:
      return '制限なし';
    case UserUsageStatus.PENDING:
      return '申請中';
    case UserUsageStatus.DEACTIVATION:
      return '利用停止';
    case UserUsageStatus.DISAPPROVAL:
      return '否認';
    case UserUsageStatus.DELETE:
      return '削除';
    case UserUsageStatus.REGISTERED:
      return '登録中';
  }
};

/** 利用ステータス */
export enum UsageStatus {
  /** 0:利用可能 */
  AVAILABLE = '0',
  /** 1:利用停止 */
  DEACTIVATION = '1',
}

/**
 * 利用ステータスの論理名を取得します。
 * @param {UsageStatus} value - 区分値
 * @returns {string} - 論理名
 */
export const convertUsageStatusName = (value: UsageStatus): string => {
  switch (value) {
    case UsageStatus.AVAILABLE:
      return '利用可能';
    case UsageStatus.DEACTIVATION:
      return '利用停止';
  }
};

/** 支払い種別 */
export enum PaymentTypes {
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
