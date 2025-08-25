import { UserApprovalType } from '@/app/_types/enum';

/**
 * ログイン FormValues
 */
export type DecisionData = {
  // 暗号文
  token: string;
};

export type DecisionResult = {
  userApprovalType: UserApprovalType;
};
