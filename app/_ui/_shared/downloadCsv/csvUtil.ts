// app/lib/csvUtil.ts
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
        const sjis = iconv.encode(output, 'Shift_JIS');
        const blob = new Blob([sjis], { type: 'text/csv' });
        resolve(blob);
      }
    });
  });
};
