import { HYPHEN, PAGE_MAX_COUNT, TEMP_HYPHEN } from '../_types/constants';
/**
 * getFile.ts
 * 汎用的な関数を管理します。
 */

/**
 * formatString
 * argsの内容を割り当てた文字列を作成する。
 *
 * @param {string} template - メッセージのテンプレート
 * @param {(string | number)[]} args 文字列または数値
 * @returns {string} メッセージ
 */
export function formatString(template: string, ...args: (string | number)[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return index < args.length ? String(args[index]) : match;
  });
}

/**
 * getEditFlag
 * 明細画面が編集モードかどうかを判定する。
 *
 * @param {string} id - ID
 * @returns {boolean} true:編集モード, false:登録モード
 */
export const getEditFlag = (id: string): boolean => {
  if (!id || (id && id === HYPHEN)) {
    return false;
  }
  return true;
};

/**
 * getPostCodeAddHyphen
 * 郵便番号7桁にハイフンを付けた文字列を返却する。
 *
 * @param {string} postal_code - 郵便番号7桁
 * @returns {string} XXX-XXXX
 */
export const getPostCodeAddHyphen = (postal_code: string): string => {
  return postal_code.slice(0, 3) + HYPHEN + postal_code.slice(3, 7);
};

/**
 * convertTimeToDate
 * 時間(string)を日付(Date)に変換する。
 *
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

/**
 * getRange
 * 次のページ数を元に、明細行の取得開始件数、取得終了件数を取得する。
 * @param {number} nextPage 次のページ数
 * @returns {{number;number;}} 取得開始件数、取得終了件数
 */
export const getRange = (nextPage: number): { startRange: number; endRange: number } => {
  const startRange = (nextPage - 1) * PAGE_MAX_COUNT;
  const endRange = startRange + PAGE_MAX_COUNT - 1;
  return { startRange, endRange };
};

/**
 * getPagenationsItems
 * ページネーションの表示項目を取得する。
 * @param {number} startRange 開始件数
 * @param {number} dataLength 終了件数
 * @param {number} count 検索件数
 * @returns {{number;number;number;}} 開始件数、終了件数、総ページ数
 */
export const getPagenationsItems = (
  startRange: number,
  dataLength: number,
  count: number
): { startRow: number; endRow: number; totalPage: number } => {
  const startRow = startRange + 1;
  const endRow = startRange + dataLength;
  const totalPage = (count ?? 0) > PAGE_MAX_COUNT ? Math.floor(count / PAGE_MAX_COUNT) + 1 : 1;

  return { startRow, endRow, totalPage };
};

/**
 * getPostgreSqlItems
 * Transaction専用・postgreSQL作成用の情報を作成する。
 * @param {object} insertValues 入力内容
 * @returns {{Array<string>;string;Array<string>;}} 開始件数、終了件数、総ページ数
 */
export const getPostgreSqlItems = (
  insertValues: object
): { columns: Array<string>; placeholders: string; values: Array<string> } => {
  const columns = Object.keys(insertValues);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');
  const values = Object.values(insertValues);

  return { columns, placeholders, values };
};

/**
 * checkTempId
 * 会社情報の部署情報、雇用種別情報の新規登録データを確認する。
 * "temp-"から始まるIDは新規登録データです。
 * @param {string} id 入力内容
 * @returns {boolean} TRUE:新規登録データ、FALSE:既存データ
 */
export const checkTempId = (id: string): boolean => {
  return id.indexOf(TEMP_HYPHEN) === 0 ? true : false;
};

/**
 * オブジェクト配列内の特定プロパティの重複チェック
 * @param {T[]} arr
 * @param {keyof T} key
 * @returns {boolean} - True:重複あり false:重複なし
 */
export const hasDuplicate = <T>(arr: T[], key: keyof T): boolean => {
  const seen = new Set();
  return arr.some((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return true;
    }
    seen.add(value);
    return false;
  });
};

/**
 * ドメイン取得
 * @param {string} email
 * @returns {string} - domain
 */
export const getDomain = (email: string): string => {
  const arr = email.split('@');
  if (arr.length === 2) {
    return arr[1];
  } else {
    return '';
  }
};
