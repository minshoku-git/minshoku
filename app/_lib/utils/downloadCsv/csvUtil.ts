import { stringify } from 'csv-stringify';
import iconv from 'iconv-lite';

/**
 * データをShift_JISでエンコードされたCSV Blobに変換する共通関数
 */
export const createCsvBlob = (data: Record<string, string>[]): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    stringify(data, { header: true, quoted_string: true }, (err, output) => {
      if (err) {
        reject(err);
      } else {
        // Shift_JISでエンコード
        const sjisBuffer = iconv.encode(output, 'Shift_JIS');

        // BufferをUint8Arrayに変換してBlobを作成
        const blob = new Blob([new Uint8Array(sjisBuffer)], { type: 'text/csv' });
        resolve(blob);
      }
    });
  });
};
