import { HYPHEN } from '../_types/values';
/**
 * getFile.ts
 * 汎用的な関数を管理します。
 */

/**
 * getEditFlag
 * 明細画面の表示モードを判定する。
 * @param {string} id ID
 * @returns {boolean} true:編集モード, false:登録モード
 */
export const getEditFlag = (id: string): boolean => {
  if (id && id === HYPHEN()) {
    return false;
  }
  return true;
};

/**
 * getPostCodeAddHyphen
 * 郵便番号7桁にハイフンを付けた文字列を返却する。
 * @param {string} post_code 郵便番号7桁
 * @returns {string} XXX-XXXX
 */
export const getPostCodeAddHyphen = (post_code: string): string => {
  return post_code.slice(0, 3) + HYPHEN() + post_code.slice(3, 7);
};

/**
 * convertTimeToDate
 * 時間(string)を日付(Date)に変換する。
 * @param {string} time 時間(00:00:00)
 * @returns {Date} 本日付の時間
 */
export const convertTimeToDate = (time: string): Date => {
  const [hours, minutes, seconds] = time.toString().split(':').map(Number);
  const now = new Date();
  now.setHours(hours);
  now.setMinutes(minutes);
  now.setSeconds(seconds || 0);
  now.setMilliseconds(0);
  return now;
};
