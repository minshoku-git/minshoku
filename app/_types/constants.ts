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
 * 署名付きURLの有効期限
 * @returns {number} - 60 * 60 (1時間)
 */
export const EXPIRES_IN_TIME: number = 60 * 60;

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

/* Supabase Storage
------------------------------------------------------------------ */
/**
 * 仮ID用文字列('temp-')
 * @returns {string} - 'temp-'
 */
export const BUCKET_SHOP_IMAGES: string = 'shop-images';

/* バリデーションメッセージ
------------------------------------------------------------------ */
export const MSG_REQUIRED = '{0}は必須入力です。';
export const MSG_INVALID = '{0}を正しく入力してください。';
export const MSG_MAX = '{0}は{1}文字以内で入力してください。';
export const MSG_MIN_TO_MAX = '{0}は{1}文字から{2}文字以内で入力してください。';
export const MSG_EMAIL = '{0}は正しく入力してください。';
export const MSG_POSTALCODE = '{0}は半角数字{1}桁を入力してください。';
export const MSG_HANKAKU_NUM = '{0}は半角数字を入力してください。';
export const MSG_DOMAIN = '有効なドメイン名を入力してください。';
export const MSG_PASSWORD = 'パスワードは8文字以上の半角英数字の組み合わせで入力してください。';

/* 正規表現集
------------------------------------------------------------------ */
export const REG_POSTALCODE = '^[0-9]{7}';
export const REG_HANKAKU_EISU = '/^[a-zA-Z0-9]+$/u';
export const REG_HANKAKU_NUM = '^\\d+$';
export const REG_ZENKAKU_KANA = '^[\u30A0-\u30FF]+$';
export const REG_DOMAIN = /^(?=.{1,253}$)(?!\-)(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
export const REG_PASSWORD = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;

export const MAX_IMAGE_SIZE = 5; // 5MB

export const ERROR_MSG_UNEXPECTED = '予期せぬエラーが発生しました。再度お試しください。';

/**
 * エラーメッセージ
 */
export const ERROR_MESSAGE = {
  /**
   * ERROR_MESSAGE.UNEXPECTED
   * 予期せぬエラーが発生しました。再度お試しください。 */
  UNEXPECTED: '予期せぬエラーが発生しました。再度お試しください。',
  /**
   * ERROR_MESSAGE.TEMPLATE
   * に失敗しました。再度お試しください。 */
  TEMPLATE: 'に失敗しました。再度お試しください。',
};
