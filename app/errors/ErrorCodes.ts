/**
 * 共通のエラーコード定義
 */
export const ErrorCodes = {
  VALIDATION_ERROR: { code: 'E001', message: '入力値不正', status: 400 },
  NOT_FOUND: { code: 'E404', message: 'に失敗しました。再度お試しください。', status: 404 },
  UNAUTHORIZED: { code: 'E401', message: '認証が必要です', status: 401 },
  INTERNAL_SERVER_ERROR: { code: 'E500', message: '予期しないエラーが発生しました。', status: 500 },
  CONFLICT: { code: 'E409', message: '他の処理と競合しました。画面を更新して再度実行してください。', status: 409 },
  EMAIL_NOT_REGISTERED: { code: 'E1001', message: '入力されたメールアドレスは登録されていません。', status: 404 },
  EMAIL_SEND_FAILED: {
    code: 'E1002',
    message: 'メールの送信に失敗しました。時間をおいて再度お試しください。',
    status: 500,
  },
  LOGOUT_FAILED: {
    code: 'E1003',
    message: 'ログアウトに失敗しました。再度お試しください。',
    status: 500,
  },
  ACCOUNT_SUSPENDED: {
    code: 'E1004',
    message: 'このアカウントは現在利用停止状態です。管理者までお問い合わせください。',
    status: 403,
  },
  AUTH_CODE_EXPIRED: {
    code: 'E1005',
    message: '認証コードの有効期限が切れています。再度リクエストを行ってください。',
    status: 400,
  },
  INVALID_RECOVERY_LINK: {
    code: 'E1006',
    message: '無効なリンクです。リンクの有効期限が切れているか、形式が正しくありません。',
    status: 400,
  },
  PASSWORD_SAME_AS_OLD: {
    code: 'E1007',
    message: '新しいパスワードは以前のパスワードと異なるものを設定してください。',
    status: 400,
  },
  EMAIL_ALREADY_REGISTERED: {
    code: 'E1008',
    message: 'このメールアドレスは既に登録されています。',
    status: 409, // CONFLICT（競合）
  },
} as const;
