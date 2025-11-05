/**
 * 共通エラークラス
 */
export class CustomError extends Error {
  code: string;
  status?: number;

  constructor(
    codeOrError: string | { code: string; message: string; status?: number },
    message?: string,
    status?: number
  ) {
    super();

    if (typeof codeOrError === 'string') {
      this.message = message || `Error code: ${codeOrError}`;
      this.code = codeOrError;
      this.status = status;
    } else {
      this.message = codeOrError.message || `Error code: ${codeOrError.code}`;
      this.code = codeOrError.code;
      this.status = codeOrError.status;
    }

    this.name = 'CustomError';
  }
}
