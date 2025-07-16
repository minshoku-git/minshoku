import { createPgClient } from '@/app/_lib/supabase/server';
import { t_menu_schedule } from '@/app/_lib/supabase/tableTypes';
import { getPostgreSqlItems } from '@/app/_lib/utill';
import { ERROR_MESSAGE } from '@/app/_types/constants';
import { ApiResponse } from '@/app/_types/types';

import { scheduleCsvValues } from './types';

/* スケジュール登録
------------------------------------------------------------------ */

/**
 * refreshingScheduleData
 * スケジュール情報を洗い替えする。
 *
 * @param {scheduleCsvValues[]} values - 検索条件
 * @returns {Promise<ApiResponse<number>>} 検索結果
 */
export const _RefreshingScheduleData = async (values: scheduleCsvValues[]): Promise<ApiResponse<number>> => {
  const req = values;
  const client = createPgClient();

  try {
    // connection Start
    await client.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await client.query('BEGIN');

    /* Dalete - t_menu_schedule
   　------------------------------------------------------------------ */
    const deleteCompanyText = 'DELETE FROM t_menu_schedule;';
    const res = await client.query(deleteCompanyText);
    if (res.rowCount === 0) {
      throw new Error('スケジュール情報の削除処理に失敗しました。');
    }
    console.log('deleted count:', res.rowCount);

    for (const item of req) {
      /* Insert - t_menu_schedule
     　------------------------------------------------------------------ */
      // InsertData setting
      const insertValues: Omit<t_menu_schedule, 'id' | 'created_at' | 'updated_at'> = {
        cancel_flag: item.cancel_flag,
        delivery_day: item.delivery_day,
        menu_name: item.menu_name,
        order_count: item.order_count,
        stock_count: item.stock_count,
        t_companies_id: item.t_companies_id,
        t_shops_id: item.t_shops_id,
        allergen_labelling: item.allergen_labelling,
        unit_price: item.unit_price,
      };
      const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
      const insertScheduleText = `INSERT INTO t_menu_schedule (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

      // Update
      const result = await client.query(insertScheduleText, values);

      if (result.rowCount === 0) {
        throw new Error('スケジュール情報の登録処理に失敗しました。');
      }
    }

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');
    // Commit
    await client.query('COMMIT');
    console.log('Transaction completed, inserted count:', req.length);
    return { data: req.length };
  } catch (error) {
    // Rollback
    await client.query('ROLLBACK');

    console.error('Transaction failed:', error);
    return { error: ERROR_MESSAGE.UNEXPECTED };
  } finally {
    // Transaction End
    await client.end();
  }
};
