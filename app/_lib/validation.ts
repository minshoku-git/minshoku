import { NextRequest } from 'next/server';
import { z } from 'zod';

import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { ApiResponse } from '../_types/types';

/**
 * Zodスキーマに基づき、NextRequestのボディをバリデーションする共通関数。
 * * @param req NextRequestオブジェクト
 * @param schema バリデーションに使用するZodスキーマ
 * @returns 成功時はバリデーション済みデータ、失敗時はエラー
 */
export const validateRequest = async <T extends z.ZodTypeAny>(
  req: NextRequest,
  schema: T
): Promise<ApiResponse<z.infer<T>>> => {
  try {
    // リクエストボディを取得
    // NOTE: この処理でリクエストボディは消費されます
    const reqBody = await req.json();

    // バリデーションはreqBody.requestに対して実行（APIRequestの構造を想定）
    const parsed = schema.safeParse(reqBody);

    if (!parsed.success) {
      console.error('Validation Error:', parsed.error);
      return {
        success: false,
        // ErrorCodes.VALIDATION_ERROR_YOURS は、適切な定義に置き換えてください
        error: ErrorCodes.VALIDATION_ERROR_YOURS,
      };
    }

    // バリデーション済みのデータ (parsed.data) を含めて返却
    return { success: true, data: parsed.data };
  } catch (e: unknown) {
    // JSONパース失敗など
    console.error(e);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }

    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
