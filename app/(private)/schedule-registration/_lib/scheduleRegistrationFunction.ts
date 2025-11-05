import { createPgClient } from '@/app/_lib/supabase/server';
import { t_menu_schedule } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow, toUTCDateFromJSTDate } from '@/app/_lib/utils/getDateTime';
import { getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { ScheduleCsvValues } from './types';

/* スケジュール登録
------------------------------------------------------------------ */

/**
 * refreshingScheduleData
 * スケジュール情報を洗い替えする。
 *
 * @param {ScheduleCsvValues[]} values - 検索条件
 * @returns {Promise<ApiResponse<number>>} 検索結果
 */
export const RefreshingScheduleData = async (values: ScheduleCsvValues[]): Promise<ApiResponse<number>> => {
  const req = values;
  const now = getNow();

  // connection Start
  const client = await createPgClient();

  try {
    // Transaction Start
    await client.query('BEGIN');

    for (const item of req) {
      /* Select - t_menu_schedule
    　------------------------------------------------------------------ */
      const selectSql = `
        SELECT id
        FROM 
          t_menu_schedule
        WHERE
          delivery_day = $1 AND
          t_companies_id = $2 AND
          t_shops_id = $3
        ORDER BY 
          updated_at DESC
        LIMIT 1;
      `;

      const delivery_day_utc = toUTCDateFromJSTDate(item.delivery_day);
      const values = [delivery_day_utc, item.t_companies_id, item.t_shops_id];
      const exData = await client.query<t_menu_schedule>(selectSql, values);
      const row = exData.rows[0];

      if (row) {
        /* Update - t_menu_schedule
        ------------------------------------------------------------------ */
        const updateValues: Omit<t_menu_schedule, 'id' | 't_companies_id' | 't_shops_id' | 'created_at'> = {
          delivery_day: item.delivery_day,
          menu_name: item.menu_name,
          menu_description: item.menu_description,
          allergen_labelling: item.allergen_labelling,
          spice_level: item.spice_level,
          stock_count: item.stock_count,
          list_price: item.list_price,
          cancel_flag: item.cancel_flag,
          updated_at: now,
        };
        const { columns, values } = getPostgreSqlItems(updateValues);

        const updateScheduleSql = `
          UPDATE 
            t_menu_schedule
          SET 
            ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
          WHERE 
            id = ${row.id}
          RETURNING id;`;

        const result = await client.query(updateScheduleSql, values);

        if (result.rowCount === 0) {
          throw new CustomError(
            ErrorCodes.NOT_FOUND.code,
            'スケジュール情報の登録処理' + ErrorCodes.NOT_FOUND.message,
            ErrorCodes.NOT_FOUND.status
          );
        }
      } else {
        /* Insert - t_menu_schedule
        ------------------------------------------------------------------ */
        const insertValues: Omit<t_menu_schedule, 'id' | 'created_at' | 'updated_at'> = {
          delivery_day: item.delivery_day,
          t_companies_id: item.t_companies_id,
          t_shops_id: item.t_shops_id,
          menu_name: item.menu_name,
          menu_description: item.menu_description,
          allergen_labelling: item.allergen_labelling,
          spice_level: item.spice_level,
          stock_count: item.stock_count,
          list_price: item.list_price,
          cancel_flag: item.cancel_flag,
        };
        const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
        const insertScheduleText = `INSERT INTO t_menu_schedule (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

        // Insert
        const result = await client.query(insertScheduleText, values);

        if (result.rowCount === 0) {
          throw new CustomError(
            ErrorCodes.NOT_FOUND.code,
            'スケジュール情報の登録処理' + ErrorCodes.NOT_FOUND.message,
            ErrorCodes.NOT_FOUND.status
          );
        }
      }
    }

    /* --------------------------------------------------------------- */
    // Commit
    await client.query('COMMIT');
    console.log('Transaction completed, inserted count:', req.length);

    // Response setting
    return { success: true, data: req.length };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    await rollbackWithLog(client);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  } finally {
    // Transaction End
    await client.end();
  }
};
