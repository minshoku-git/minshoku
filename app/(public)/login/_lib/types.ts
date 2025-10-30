import { z } from 'zod';

import { MSG_EMAIL, MSG_MAX, MSG_REQUIRED } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';

/**
 * ログイン Schema
 */
export const LoginSchema = z.object({
  /** メールアドレス */
  email: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') })
    .email(formatString(MSG_EMAIL, 'メールアドレス'))
    .max(256, formatString(MSG_MAX, 'メールアドレス', '256')),
  /** パスワード */
  password: z.string().nonempty({ message: formatString(MSG_REQUIRED, 'パスワード') }),
});

/**
 * ログイン FormValues
 */
export type LoginFormValues = z.infer<typeof LoginSchema>;
