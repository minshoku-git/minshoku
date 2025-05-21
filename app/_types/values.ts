/**
 * values.tsx
 * 全機能共通で使用する定数を管理します。
 * マジックナンバーは使わないこと！
 */

/**
 * 検索画面の一頁あたりの表示上限件数
 * @returns 最大表示件数(30件)
 */
export const pageMaxCount = () => {
  return 30;
};

/**
 * 1KBのByte数(1024Byte)
 * @returns 1024
 */
export const KB_ByteSize = () => {
  return 1024;
};

/**
 * 添付可能な画像拡張子
 * @returns string<Array> ['image/png', 'image/jpg', 'image/jpeg']
 */
export const IMAGE_TYPES = () => {
  return ['image/png', 'image/jpg', 'image/jpeg'];
};

export const HYPHEN = () => {
  return '-';
};

export const TEMP_HYPHEN = () => {
  return 'temp-';
};
