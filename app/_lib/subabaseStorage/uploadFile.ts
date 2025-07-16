import { SupabaseClient } from '@supabase/supabase-js';

/**
 * ファイルアップロード
 * @param {SupabaseClient} client
 * @param {string} bucketName
 * @param {string} filePath
 * @param {File} file
 */
export const uploadFile = async (client: SupabaseClient, bucketName: string, filePath: string, file: File) => {
  try {
    // ファイルを指定したバケットにアップロード
    const { data, error } = await client.storage.from(bucketName).upload(filePath, file);

    if (error) {
      throw new Error('Error uploading file: ' + error.message);
    }

    console.log('File uploaded successfully:', data);
  } catch (e) {
    console.error('An error occurred:', (e as Error).message);
    throw new Error('Error uploading file: ' + (e as Error).message);
  }
};
