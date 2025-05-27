/**
 * values.tsx
 * 全機能共通で使用する定数を管理します。
 * マジックナンバーは使わないこと！
 */

/**
 * 検索画面の一頁あたりの表示上限件数
 * @returns {number} - 最大表示件数(30件)
 */
export const pageMaxCount = (): number => {
  return 30;
};

/**
 * 1KBのByte数(1024Byte)
 * @returns {number} - 1024
 */
export const KB_ByteSize = (): number => {
  return 1024;
};

/**
 * 添付可能な画像拡張子
 * @returns {Array<string>} - ['image/png', 'image/jpg', 'image/jpeg']
 */
export const IMAGE_TYPES = (): Array<string> => {
  return ['image/png', 'image/jpg', 'image/jpeg'];
};

/**
 * ハイフン
 * @returns {string} - '-'
 */
export const HYPHEN = (): string => {
  return '-';
};

/**
 * 仮ID用文字列('temp-')
 * @returns {string} - 'temp-'
 */
export const TEMP_HYPHEN = (): string => {
  return 'temp-';
};
