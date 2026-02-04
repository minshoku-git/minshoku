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
    const contentType = req.headers.get('content-type') || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let reqBody: any;

    if (contentType.includes('multipart/form-data')) {
      // --- FormData の場合の処理 ---
      const formData = await req.formData();
      // 基本的な値を取得
      const formValues = formData.get('formValues') as string;
      const data = formValues ? JSON.parse(formValues) : {};

      // 画像などのファイルや数値をマッピング（必要に応じて）
      reqBody = {
        request: {
          ...data,
          shop_image_file_data: formData.get('shop_image_file_data'),
          shop_image_file_name: formData.get('shop_image_file_name'),
          shop_image_file_bytesize: Number(formData.get('shop_image_file_bytesize') || 0),
        },
      };
    } else {
      // --- 通常の JSON の場合の処理 ---
      reqBody = await req.json();
    }

    const parsed = schema.safeParse(reqBody);

    if (!parsed.success) {
      console.error('Validation Error:', JSON.stringify(parsed.error.format(), null, 2));
      return {
        success: false,
        error: ErrorCodes.VALIDATION_ERROR_YOURS,
      };
    }

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

/**
 * 既にオブジェクトになっているデータをバリデーションするだけの軽量版
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateObject = <T extends z.ZodTypeAny>(data: any, schema: T): ApiResponse<z.infer<T>> => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    console.error('Validation Error:', JSON.stringify(parsed.error.format(), null, 2));
    return {
      success: false,
      error: ErrorCodes.VALIDATION_ERROR_YOURS,
    };
  }
  return { success: true, data: parsed.data };
};
