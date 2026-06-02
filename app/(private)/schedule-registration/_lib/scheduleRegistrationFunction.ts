import { createPgClient } from '@/app/_lib/supabase/server';
import { t_menu_schedule } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow, toUTCDateFromJSTDate } from '@/app/_lib/utils/getDateTime';
import { getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { ScheduleCsvValues, ScheduleRegistrationResult, FailedScheduleRow } from './types';

/* スケジュール登録
------------------------------------------------------------------ */

/**
 * refreshingScheduleData
 * スケジュール情報をルールに基づいて登録・更新・除外する。
 */
export const RefreshingScheduleData = async (
  values: ScheduleCsvValues[]
): Promise<ApiResponse<ScheduleRegistrationResult>> => {
  const req = values;
  const now = getNow();
  const client = await createPgClient();

  // 成功件数と失敗行を保持するコンテナ
  const failedRows: FailedScheduleRow[] = [];
  let successCount = 0;

  try {
    await client.query('BEGIN');

    for (const item of req) {
      /* Select - t_menu_schedule
    　------------------------------------------------------------------ */
      // 会社IDと配達日が一致する既存データを一度検索します（店舗ID比較のため）
      const selectSql = `
        SELECT id, t_shops_id
        FROM t_menu_schedule
        WHERE delivery_day = $1 AND t_companies_id = $2
        ORDER BY updated_at DESC
        LIMIT 1;
      `;

      const delivery_day_utc = toUTCDateFromJSTDate(item.delivery_day);
      const queryValues = [delivery_day_utc, item.t_companies_id];
      const exData = await client.query<t_menu_schedule>(selectSql, queryValues);
      const row = exData.rows[0];

      if (row) {
        // 【配達日】と【会社ID】が一致する既存データがある場合
        if (Number(row.t_shops_id) === Number(item.t_shops_id)) {
          /* 1. 全てが一致する -> UPDATE */
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
          const { columns, values: updateParams } = getPostgreSqlItems(updateValues);

          const updateScheduleSql = `
            UPDATE t_menu_schedule
            SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
            WHERE id = ${row.id}
            RETURNING id;`;

          const result = await client.query(updateScheduleSql, updateParams);
          if (result.rowCount === 0) {
            throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, 'スケジュール情報の登録処理' + ErrorCodes.DB_QUERY_FAILED.message, ErrorCodes.DB_QUERY_FAILED.status);
          }
          successCount++;
        } else {
          /* 2. 配達日・会社IDは一致するが、店舗IDが違う場合 -> 登録対象外（スキップして画面へ返却） */
          // 画面に綺麗に表示するため、日付オブジェクトを yyyy-MM-dd 文字列に整形します
          const dateStr = item.delivery_day instanceof Date
            ? item.delivery_day.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
            : String(item.delivery_day);

          failedRows.push({
            delivery_day: dateStr,
            t_companies_id: item.t_companies_id,
            t_shops_id: item.t_shops_id,
            menu_name: item.menu_name,
          });
        }
      } else {
        /* 3. 一致するものが何もない場合 -> INSERT */
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
        const { columns, placeholders, values: insertParams } = getPostgreSqlItems(insertValues);
        const insertScheduleText = `INSERT INTO t_menu_schedule (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

        const result = await client.query(insertScheduleText, insertParams);
        if (result.rowCount === 0) {
          throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, 'スケジュール情報の登録処理' + ErrorCodes.DB_QUERY_FAILED.message, ErrorCodes.DB_QUERY_FAILED.status);
        }
        successCount++;
      }
    }

    // エラー行以外の正常データを確定させます
    await client.query('COMMIT');
    console.log('Transaction completed. Success:', successCount, 'Failed:', failedRows.length);

    return {
      success: true,
      data: {
        successCount,
        failedRows,
      },
    };
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
