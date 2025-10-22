import { UserApprovalType } from '@/app/_types/enum';

/**
 * ログイン FormValues
 */
export type DecisionData = {
  /** ユーザー承認種別 */
  userApprovalType: string;
  /** 暗号 */
  token: string;
};

export type DecisionResult = {
  userApprovalType: UserApprovalType;
};
