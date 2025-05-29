import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_EMAIL, MSG_MAX, MSG_REQUIRED } from '@/app/_types/constants';

/**
 * ログイン Schema
 */
export const LoginSchema = z.object({
  /** ステータス */
  password: z.string().nonempty({ message: formatString(MSG_REQUIRED, 'パスワード') }),
  /** メモ */
  email: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') })
    .email(formatString(MSG_EMAIL, 'メールアドレス'))
    .max(256, formatString(MSG_MAX, 'メールアドレス', '256')),
});

/**
 * ログイン FormValues
 */
export type LoginFormValues = z.infer<typeof LoginSchema>;
