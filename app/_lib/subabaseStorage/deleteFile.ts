import { SupabaseClient } from '@supabase/supabase-js';

/**
 * ファイル削除
 * @param {SupabaseClient} client
 * @param {string} bucketName
 * @param {string} filePath
 * @return {Promise<void>} void
 */
export const deleteFile = async (client: SupabaseClient, bucketName: string, filePath: string): Promise<void> => {
  try {
    const { data, error } = await client.storage.from(bucketName).remove([filePath]);

    if (error) {
      console.error(error);
      throw new Error('Error deleting image: ' + error.message);
    }

    console.log('Image deleted successfully:', data);
  } catch (e) {
    console.error(e);
    throw new Error('Error deleting image: ' + (e as Error).message);
  }
};
