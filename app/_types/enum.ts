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

/** ユーザー登録ステータス */
export enum UserRegistrationStatus {
  /** 0:承認待ち */
  WAITING_APPROVAL = '0',
  /** 1:否認 */
  DISAPPROVAL = '1',
  /** 2:メール認証待ち */
  WAITING_EMAIL_VERIFICATION = '2',
  /** 3:支払方法登録待ち */
  WAITING_PAYMENT_SETUP = '3',
  /** 4:登録済み */
  REGISTERED = '4',
}

/**
 * ユーザー登録ステータスの論理名を取得します。
 * @param {UserRegistrationStatus} value - 締め切り番号
 * @returns {string} - 論理名
 */
export const convertUserRegistrationStatusName = (value: UserRegistrationStatus): string => {
  switch (value) {
    case UserRegistrationStatus.WAITING_APPROVAL:
      return '承認待ち';
    case UserRegistrationStatus.DISAPPROVAL:
      return '否認';
    case UserRegistrationStatus.WAITING_EMAIL_VERIFICATION:
      return 'メール認証待ち';
    case UserRegistrationStatus.WAITING_PAYMENT_SETUP:
      return '支払方法登録待ち';
    case UserRegistrationStatus.REGISTERED:
      return '登録済み';
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
export enum PaymentType {
  /** 0:会社清算 */
  SALAEY_DEDUCTIONS = '0',
  /** 1:クレジットカード */
  CREDITCARD = '1',
  /** 2:PayPay */
  PAYPAY = '2',
}

/**
 * ユーザー登録ステータスの論理名を取得します。
 * @param {UserRegistrationStatus} value - 締め切り番号
 * @returns {string} - 論理名
 */
export const convertPaymentTypeName = (value: PaymentType): string => {
  switch (value) {
    case PaymentType.SALAEY_DEDUCTIONS:
      return '会社清算';
    case PaymentType.CREDITCARD:
      return 'クレジットカード';
    case PaymentType.PAYPAY:
      return 'PayPay';
  }
};

/** オーダーステータス */
export enum OrderStatusType {
  /** 0:有効 */
  VALID = '0',
  /** 1:キャンセル */
  USER_CANCEL = '1',
  /** 2:システムキャンセル */
  SYSTEM_CANCEL = '2',
}

/** ユーザー承認種別 */
export enum UserApprovalType {
  /** 0:承認 */
  APPROVAL = '0',
  /** 1:否認 */
  DISAPPROVAL = '1',
  /** 2:処理済み */
  PROCESSED = '2',
}

/** 検索アクション種別 */
export enum SearchType {
  /** 0:検索 */
  SEARCH = '0',
  /** 1:ソート */
  SORT = '1',
  /** 2:ページネーション */
  PAGENATION = '2',
}

/** 選択種別 */
export enum SelectType {
  /** 0:未選択 */
  UNSELECTED = '0',
  /** 1:選択 */
  SELECTED = '1',
}

export enum DeletionStatus {
  /** 0: 有効（未削除） */
  ACTIVE = '0',
  /** 1: 削除済み */
  DELETED = '1',
}
