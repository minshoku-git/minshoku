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
 * Supabaseから1回のクエリで取得できる最大件数（PostgRESTの既定上限）
 * CSV出力など全件取得が必要な処理は、この件数ずつ分割して取得する。
 * @returns {number} - 1000件
 */
export const DB_FETCH_MAX_ROWS: number = 1000;

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
 * 店舗画像バケット名
 * @returns {string} - 'shop-images'
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
export const MSG_INTEGER = '{0}は半角数字（整数）で入力してください。';
export const MSG_DATE = '{0}は日付（例：2026/10/01）で入力してください。';

/* CSV取込メッセージ
------------------------------------------------------------------ */
export const MSG_CSV_ROW = '{0}行目：{1}';
export const MSG_CSV_INPUT_VALUE = '{0}（入力値：「{1}」）';
export const MSG_CSV_COLUMN_SHORT = '列数が足りません（{0}列必要ですが{1}列です）。';
export const MSG_CSV_COLUMN_OVER = '列数が多すぎます（{0}列必要ですが{1}列です）。';
export const MSG_CSV_HEADER_MISSING = '見出し行に「{0}」列がありません。';
export const MSG_CSV_HEADER_UNKNOWN = '見出し行の「{0}」は不明な列名です。';
export const MSG_CSV_NO_DATA = 'データ行がありません。';
export const MSG_CSV_FORMAT = 'CSVの形式が不正です（ダブルクォート「"」の閉じ忘れなど）。';
export const MSG_CSV_COMPANY_NOT_FOUND = '会社ID「{0}」は存在しません。';
export const MSG_CSV_SHOP_NOT_FOUND = '店舗ID「{0}」は存在しません。';

/* 正規表現集
------------------------------------------------------------------ */
export const REG_POSTALCODE = '^[0-9]{7}';
export const REG_HANKAKU_EISU = '/^[a-zA-Z0-9]+$/u';
export const REG_HANKAKU_NUM = '^\\d+$';
export const REG_ZENKAKU_KANA = '^(?=.*[ァ-ヺ])[゠-ヿ　 ]+$'; // 全角カタカナ1文字以上必須。全角・半角スペースを許容
export const REG_DOMAIN = /^(?=.{1,253}$)(?!\-)(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
export const REG_PASSWORD = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
