/**
 * 共通のエラーコード定義
 */
export const ErrorCodes = {
  VALIDATION_ERROR: { code: 'E001', message: '入力値不正', status: 400 },
  NOT_FOUND: { code: 'E404', message: 'に失敗しました。再度お試しください。', status: 404 },
  UNAUTHORIZED: { code: 'E401', message: '認証が必要です', status: 401 },
  INTERNAL_SERVER_ERROR: { code: 'E500', message: '予期しないエラーが発生しました。', status: 500 }, // ← 追加
  CONFLICT: { code: 'E409', message: '他の処理と競合しました。画面を更新して再度実行してください。', status: 409 },
  EMAIL_NOT_REGISTERED: { code: 'E1001', message: '入力されたメールアドレスは登録されていません。', status: 404 },
  EMAIL_SEND_FAILED: {
    code: 'E1002',
    message: 'メールの送信に失敗しました。時間をおいて再度お試しください。',
    status: 500,
  },
} as const;
