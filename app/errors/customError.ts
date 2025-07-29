/**
 * 共通エラークラス
 */
export class CustomError extends Error {
  code: string;
  status?: number;

  // ErrorCodes のようなオブジェクトを受け取るオーバーロードを追加
  constructor(
    codeOrError: string | { code: string; message: string; status?: number },
    message?: string,
    status?: number
  ) {
    if (typeof codeOrError === 'string') {
      super(message);
      this.code = codeOrError;
      this.status = status;
    } else {
      super(codeOrError.message);
      this.code = codeOrError.code;
      this.status = codeOrError.status;
    }
    this.name = 'CustomError';
  }
}
