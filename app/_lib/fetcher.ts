import { CustomError } from '../errors/customError';

export const fetcher = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, {
    ...init,
    credentials: 'include', // クッキーをリクエストに含める
  });

  // レスポンスのボディを取得して確認
  const responseBody = await res.json();
  console.log('Response Body:', responseBody); // ボディの中身を確認

  if (!res.ok || !responseBody.success) {
    throw new CustomError(responseBody);
  }

  return responseBody; // 成功した場合、ボディを返す
};
