import { z } from 'zod';

import { MSG_EMAIL, MSG_REQUIRED } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';

/**
 * ログイン Schema
 */
export const LoginSchema = z
  .object({
    /** メールアドレス */
    email: z
      .email(formatString(MSG_EMAIL, 'メールアドレス'))
      .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') }),
    /** パスワード */
    password: z.string().nonempty({ message: formatString(MSG_REQUIRED, 'パスワード') }),
  })
  .strict();

/**
 * ログイン FormValues
 */
export type LoginFormValues = z.infer<typeof LoginSchema>;
