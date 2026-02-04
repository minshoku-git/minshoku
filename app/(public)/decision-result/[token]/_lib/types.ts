import z from 'zod';

import { UserApprovalType } from '@/app/_types/enum';

/**
 * ログイン 入力用バリデーションスキーマ
 */
export const DecisionSchema = z.object({
  userApprovalType: z.string(),
  token: z.string(),
});
/**
 * ログイン API用バリデーションスキーマ
 */
export const DecisionApiSchema = z
  .object({
    request: DecisionSchema,
  })
  .strict();
/**
 * ログイン FormValues
 */
export type DecisionData = z.infer<typeof DecisionSchema>;

export type DecisionResult = {
  userApprovalType: UserApprovalType;
};
