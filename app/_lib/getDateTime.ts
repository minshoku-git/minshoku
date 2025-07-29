import { format, startOfMonth, subDays, subMonths } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * getDateTime.tsx
 * 日時に関わる関数を管理します。
 */

/**
 * 現在日時の取得
 * @returns {date} 現在日時
 */
export function getNow(): Date {
  const utfDate = new Date();
  return toZonedTime(utfDate, 'Asia/Tokyo');
}

/**
 * 現在日のX時取得
 * @returns {date} 現在日0時
 */
export function getTodayXHour(H: number = 0): Date {
  const d = getNow();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), H, 0, 0);
}

/**
 * 明日の取得
 * @returns {date} 日付(明日)
 */
export function getTomorrow(): Date {
  const today = getNow();
  return new Date(today.getFullYear(), today.getMonth(), parseInt(('00' + today.getDate()).slice(-2)) + 1);
}

/**
 * 昨日の取得
 * @returns {date} 日付(昨日)
 */
export function getYesterday(): Date {
  const today = getNow();
  return new Date(today.getFullYear(), today.getMonth(), parseInt(('00' + today.getDate()).slice(-2)) - 1);
}

/**
 * 今月1日の取得
 * @returns {date} 日付(今月1日)
 */
export function getThisMonthStartDay(): Date {
  return startOfMonth(new Date());
}

/**
 * 先月1日の取得
 * @returns {date} 日付(先月1日)
 */
export function getLastMonthStartDay(): Date {
  const startDay = getThisMonthStartDay();
  return subMonths(startDay, +1);
}

/**
 * 先月最終日の取得
 * @returns {date} 日付(先月最終日)
 */
export function getLastMonthEndDay(): Date {
  const startDay = getThisMonthStartDay();
  return subDays(startDay, +1);
}

/**
 * getTimeString
 * Dateから文字列の時間('HH:mm')の取得
 * @param date - 日時
 * @returns {string} 'HH:mm'
 */
export function getTimeString(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * getTimeString
 * Dateから文字列の日付('yyyy/MM/dd')の取得
 * @param date - 日付
 * @returns {string} 'yyyy/MM/dd'
 */
export function getDateString(date: Date): string {
  return format(date, 'yyyy/MM/dd');
}

/**
 * getDatetimeString
 * Dateから文字列の日付('yyyy/MM/dd HH:mm')の取得
 * @param date - 日付
 * @returns {string} 'yyyy/MM/dd HH:mm'
 */
export function getDatetimeString(date: Date): string {
  return format(date, 'yyyy/MM/dd HH:mm');
}
