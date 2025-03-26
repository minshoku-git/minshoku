import { startOfMonth, subDays, subMonths } from 'date-fns';
/**
 * getDateTime.tsx
 * 日時に関わる関数を管理します。
 */

/**
 * 現在日の取得
 * @returns date 日付(本日)
 */
export function getToday() {
  return new Date();
}

/**
 * 明日の取得
 * @returns date 日付(明日)
 */
export function getTomorrow() {
  const today = getToday();
  return new Date(today.getFullYear(), today.getMonth(), parseInt(('00' + today.getDate()).slice(-2)) + 1);
}

/**
 * 昨日の取得
 * @returns date 日付(昨日)
 */
export function getYesterday() {
  const today = getToday();
  return new Date(today.getFullYear(), today.getMonth(), parseInt(('00' + today.getDate()).slice(-2)) - 1);
}

/**
 * 今月1日の取得
 * @returns date 日付(今月1日)
 */
export function getThisMonthStartDay() {
  return startOfMonth(new Date());
}

/**
 * 先月1日の取得
 * @returns date 日付(先月1日)
 */
export function getLastMonthStartDay() {
  const startDay = getThisMonthStartDay();
  return subMonths(startDay, +1);
}

/**
 * 先月最終日の取得
 * @returns date 日付(先月最終日)
 */
export function getLastMonthEndDay() {
  const startDay = getThisMonthStartDay();
  return subDays(startDay, +1);
}
