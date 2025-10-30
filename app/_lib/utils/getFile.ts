/**
 * getFile.tsx
 * Fileに関わる関数を管理します。
 */

import { KB_BYTE_SIZE } from '../../_config/constants';

/**
 * byte => MB 変換
 * @returns date 日付(明日)
 */
export function getMbSize(bite: number) {
  return Math.round((bite / (KB_BYTE_SIZE * KB_BYTE_SIZE)) * 100.0) / 100.0;
}

/**
 * 添付ファイルサイズオーバー判定(1MB)
 * @returns boolean True:オーバー false:規定内
 */
export function getAttachmentSizeOver(mb: number) {
  return 1 < mb;
}

/**
 * 全角半角トリム
 * @returns boolean True:オーバー false:規定内
 */
export const ex_trimSpase = (value: string) => {
  return value.replace(/\s+/g, '');
};
