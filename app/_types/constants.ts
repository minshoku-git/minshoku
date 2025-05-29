/**
 * constants.ts
 * 全機能共通で使用する定数を管理します。
 * マジックナンバーは使わないこと！
 */

/**
 * 検索画面の一頁あたりの表示上限件数
 * @returns {number} - 最大表示件数(30件)
 */
export const PAGE_MAX_COUNT: number = 30;

/**
 * 1KBのByte数(1024Byte)
 * @returns {number} - 1024
 */
export const KB_BYTE_SIZE: number = 1024;

/**
 * 添付可能な画像拡張子
 * @returns {Array<string>} - ['image/png', 'image/jpg', 'image/jpeg']
 */
export const IMAGE_TYPES: Array<string> = ['image/png', 'image/jpg', 'image/jpeg'];

/**
 * ハイフン
 * @returns {string} - '-'
 */
export const HYPHEN: string = '-';

/**
 * 仮ID用文字列('temp-')
 * @returns {string} - 'temp-'
 */
export const TEMP_HYPHEN: string = 'temp-';

/* バリデーションメッセージ
------------------------------------------------------------------ */
export const MSG_REQUIRED = '{0}は必須入力です。';
export const MSG_INVALID = '{0}を正しく入力してください。';
export const MSG_MAX = '{0}は{1}文字以内で入力してください。';
export const MSG_EMAIL = '{0}は正しく入力してください。';
export const MSG_POSTALCODE = '{0}は半角数字7桁を入力してください。';
export const MSG_HANKAKU_NUM = '{0}は半角数字を入力してください。';

/* 正規表現集
------------------------------------------------------------------ */
export const REG_POSTALCODE = '^[0-9]{7}';
export const REG_HANKAKU_EISU = '/^[a-zA-Z0-9]+$/u';
export const REG_HANKAKU_NUM = '^\\d+$';
export const REG_ZENKAKU_KANA = '^[\u30A0-\u30FF]+$';

export const MAX_IMAGE_SIZE = 5; // 5MB
