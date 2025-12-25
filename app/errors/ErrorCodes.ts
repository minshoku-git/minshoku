/**
 * 共通のエラーコード定義
 */
export const FETCH_FAILURE_MESSAGE =
  'データの取得に失敗しました。ネットワーク接続を確認するか、しばらくしてから再度お試しください。';
export const MUTATE_FAILURE_MESSAGE =
  'データの更新に失敗しました。ネットワーク接続を確認するか、しばらくしてから再度お試しください。';
export const ErrorCodes = {
  // --- 400系: クライアント入力・不正リクエスト ---
  AUTH_CODE_EXPIRED: {
    code: 'E400-01',
    message: '認証コードの有効期限が切れています。再度リクエストを行ってください。',
    status: 400,
  },
  INVALID_RECOVERY_LINK: {
    code: 'E400-02',
    message: '無効なリンクです。リンクの有効期限が切れているか、形式が正しくありません。',
    status: 400,
  },
  PASSWORD_SAME_AS_OLD: {
    code: 'E400-03',
    message: '新しいパスワードは以前のパスワードと異なるものを設定してください。',
    status: 400,
  },
  CSV_VALIDATION_FAILED: {
    code: 'E400-04',
    message: 'CSVファイルに不正なデータが含まれています。内容を確認してください。',
    status: 400,
  },
  VALIDATION_ERROR: {
    code: 'E400-05',
    message: '入力されたデータに不正な値が含まれています。入力内容を再確認してください。',
    status: 400,
  },
  PASSWORD_CONFIRMATION_MISMATCH: {
    code: 'E400-06',
    message: '新しいパスワードと確認用パスワードが一致しません。',
    status: 400,
  },
  ORDER_EXPIRED: {
    code: 'E400-07',
    message: '注文期限を超過しています。再度確認してください。',
    status: 400,
  },

  // --- 401系: 認証が必要 ---
  INVALID_CREDENTIALS: {
    code: 'E401-01', // 採番変更
    message: 'ログイン情報が正しくありません。メールアドレスとパスワードをご確認ください。',
    status: 401,
  },
  LOGIN_FAILED: {
    code: 'E401-02',
    message: 'ログインに失敗しました。時間をおいて再度お試しください。',
    status: 401,
  },
  LOGGED_OUT: {
    code: 'E401-03',
    message: 'セッションが存在しません。再度ログインしてください。',
    status: 401,
  },
  CURRENT_PASSWORD_INCORRECT: {
    code: 'E401-04',
    message: '現在のパスワードが正しくありません。',
    status: 401,
  },

  // --- 403系: 権限不足 ---
  ACCOUNT_SUSPENDED: {
    code: 'E403-01',
    message: 'このアカウントは現在利用停止状態です。管理者までお問い合わせください。',
    status: 403,
  },
  COMPANY_SUSPENDED: {
    code: 'E403-02',
    message: 'この会社アカウントは現在利用停止状態です。管理者までお問い合わせください。',
    status: 403,
  },

  // --- 404系: リソース未検出 ---
  EMAIL_NOT_REGISTERED: {
    code: 'E404-01',
    message: '入力されたメールアドレスは登録されていません。',
    status: 404,
  },
  FILE_NOT_FOUND: {
    code: 'E404-02',
    message: '指定されたファイルが存在しません。ファイルのパスや名前を確認してください。',
    status: 404,
  },

  // --- 409系: 競合 ---
  CONFLICT: {
    code: 'E409-01',
    message: '他のユーザーまたは処理と競合しました。画面を更新して再度実行してください。',
    status: 409,
  },
  EMAIL_ALREADY_REGISTERED: {
    code: 'E409-02',
    message: 'このメールアドレスは既に登録されています。',
    status: 409,
  },
  ORDER_ALREADY_PLACED: {
    code: 'E409-03',
    message: 'この注文は既に完了しています。再度確認してください。',
    status: 409,
  },

  // --- 500系: サーバー/システムエラー ---
  DB_QUERY_FAILED: {
    code: 'E500-01',
    message: 'に失敗しました。時間をおいて再度お試しください。',
    status: 500,
  },
  INTERNAL_SERVER_ERROR: {
    code: 'E500-02',
    message: '予期しないエラーが発生しました。時間をおいて再度お試しください。',
    status: 500,
  },
  EMAIL_SEND_FAILED: {
    code: 'E500-03',
    message: 'メールの送信に失敗しました。時間をおいて再度お試しください。',
    status: 500,
  },
  LOGOUT_FAILED: {
    code: 'E500-04',
    message: 'ログアウトに失敗しました。時間をおいて再度お試しください。',
    status: 500,
  },
  VALIDATION_ERROR_YOURS: {
    code: 'E500-05',
    message: '不正なリクエスト形式です。',
    status: 500,
  },
} as const;
