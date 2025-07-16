import { SupabaseClient } from '@supabase/supabase-js';

import { EXPIRES_IN_TIME } from '@/app/_types/constants';

/**
 * 画像URLを取得する
 * @param {SupabaseClient} client
 * @param {string} bucketName
 * @param {string} filePath
 * @returns {string} - imageUrl
 */
export const getImageUrl = (client: SupabaseClient, bucketName: string, filePath: string): string => {
  const {
    data: { publicUrl },
  } = client.storage.from(bucketName).getPublicUrl(filePath);

  if (!publicUrl) {
    console.error('Error getting image URL:');

    return '';
  }

  // 取得した画像のURLを返す
  return publicUrl;
};

/**
 * 署名付き画像URLを取得する
 *
 * TODO:
 * storageのpolicy設定が最重要かつ仕様詰めが必要
 * supabaseAuthenticationを利用する場合、
 * 認証済みユーザーのみ許可するように設定変更した方がいい
 * 現在は全てのユーザーに対してアクセス許可を出している
 *
 * @param {SupabaseClient} client
 * @param {string} bucketName
 * @param {string} filePath
 * @returns {string} - 署名付き画像URL
 */
export const getImageSignedUrl = async (
  client: SupabaseClient,
  bucketName: string,
  filePath: string
): Promise<string> => {
  try {
    // 署名付きURLを生成
    const { data, error } = await client.storage.from(bucketName).createSignedUrl(filePath, EXPIRES_IN_TIME);

    if (error) {
      console.error(error);
      throw new Error('Error getting image signed URL:' + error.message);
    }
    return data.signedUrl;
  } catch (e) {
    console.error(e);
    throw new Error('Error getting image signed URL:' + (e as Error).message);
  }
};
