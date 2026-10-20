/**
 * 共通エラークラス
 */
export class CustomError extends Error {
  code: string;
  status?: number;
  /** エラー詳細の一覧（CSV取込の行ごとのエラーなど、1件のメッセージに収まらない内容） */
  details?: string[];

  constructor(
    codeOrError: string | { code: string; message: string; status?: number; details?: string[] },
    message?: string,
    status?: number,
    details?: string[]
  ) {
    super();

    if (typeof codeOrError === 'string') {
      this.message = message || `Error code: ${codeOrError}`;
      this.code = codeOrError;
      this.status = status;
      this.details = details;
    } else {
      this.message = codeOrError.message || `Error code: ${codeOrError.code}`;
      this.code = codeOrError.code;
      this.status = codeOrError.status;
      this.details = codeOrError.details;
    }

    this.name = 'CustomError';
  }
}
