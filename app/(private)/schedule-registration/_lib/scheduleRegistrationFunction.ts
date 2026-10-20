import { CsvError, parse } from 'csv-parse/sync';

import {
  MSG_CSV_COLUMN_OVER,
  MSG_CSV_COLUMN_SHORT,
  MSG_CSV_COMPANY_NOT_FOUND,
  MSG_CSV_FORMAT,
  MSG_CSV_HEADER_MISSING,
  MSG_CSV_HEADER_UNKNOWN,
  MSG_CSV_INPUT_VALUE,
  MSG_CSV_NO_DATA,
  MSG_CSV_ROW,
  MSG_CSV_SHOP_NOT_FOUND,
} from '@/app/_config/constants';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_menu_schedule } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow } from '@/app/_lib/utils/getDateTime'; // ★不要な toUTCDateFromJSTDate を削除
import { formatString, getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import {
  FailedScheduleRow,
  SCHEDULE_CSV_COLUMNS,
  ScheduleCsvRow,
  ScheduleCsvSchema,
  ScheduleCsvValues,
  ScheduleRegistrationResult,
} from './types';

/* CSV解析・検証
------------------------------------------------------------------ */

/** 行番号付きのエラー（行順に並べ替えてから表示するため） */
type CsvLineError = { line: number; message: string };

/**
 * CSV検証エラーを throw する。
 * エラーは行番号順に並べ、「○行目：内容」の形式で CustomError.details に詰める。
 *
 * @param {CsvLineError[]} errors - 行番号付きのエラー一覧
 * @returns {never} 常に throw する
 */
const throwCsvValidationError = (errors: CsvLineError[]): never => {
  const details = [...errors]
    .sort((a, b) => a.line - b.line)
    .map((e) => (e.line > 0 ? formatString(MSG_CSV_ROW, e.line, e.message) : e.message));
  throw new CustomError(
    ErrorCodes.CSV_VALIDATION_FAILED.code,
    ErrorCodes.CSV_VALIDATION_FAILED.message,
    ErrorCodes.CSV_VALIDATION_FAILED.status,
    details
  );
};

/**
 * parseScheduleCsv
 * スケジュールCSVの文字列を解析・検証し、行番号付きのデータに変換する。
 * 1件目のエラーで止めずに全行を検証し、エラーがあれば全件をまとめて throw する（1件でもエラーがあれば登録しない）。
 *
 * @param {string} text - デコード済みのCSV文字列
 * @returns {Promise<ScheduleCsvRow[]>} 検証済みのスケジュールデータ（行番号付き）
 */
export const parseScheduleCsv = async (text: string): Promise<ScheduleCsvRow[]> => {
  /* 1.CSVパース
  ------------------------------------------------------------------ */
  let records: { record: string[]; info: { lines: number } }[];
  try {
    // 改行コードをLFに統一する（CRLFのままだとセル内改行がある場合にcsv-parseの行番号がずれるため）
    records = parse(text.replace(/\r\n?/g, '\n'), {
      relax_column_count: true, // 列数の過不足は自前で行番号付きのエラーにする
      skip_empty_lines: true,
      skip_records_with_empty_values: true, // Excel出力で末尾に付く「,,,,」だけの行を無視する
      info: true,
    });
  } catch (e: unknown) {
    if (e instanceof CsvError) {
      return throwCsvValidationError([{ line: e.lines ?? 0, message: MSG_CSV_FORMAT }]);
    }
    throw e;
  }

  /* 2.見出し行チェック
  ------------------------------------------------------------------ */
  const [headerRecord, ...dataRecords] = records;
  if (!headerRecord || dataRecords.length === 0) {
    return throwCsvValidationError([{ line: 0, message: MSG_CSV_NO_DATA }]);
  }
  const header = headerRecord.record.map((h) => h.trim());
  const columns: string[] = SCHEDULE_CSV_COLUMNS;
  const headerErrors: CsvLineError[] = [
    ...columns.filter((c) => !header.includes(c)).map((c) => formatString(MSG_CSV_HEADER_MISSING, c)),
    ...header.filter((h) => !columns.includes(h)).map((h) => formatString(MSG_CSV_HEADER_UNKNOWN, h)),
  ].map((message) => ({ line: headerRecord.info.lines, message }));
  if (headerErrors.length > 0) {
    // 見出しが不正だと全行の列がずれるため、データ行の検証はしない
    return throwCsvValidationError(headerErrors);
  }

  /* 3.データ行チェック
  ------------------------------------------------------------------ */
  const errors: CsvLineError[] = [];
  const rows: ScheduleCsvRow[] = [];
  for (const { record, info } of dataRecords) {
    // info.lines はレコードの最終行のため、セル内改行の分を引いて開始行にする
    const line = info.lines - record.reduce((n, field) => n + (field.match(/\n/g)?.length ?? 0), 0);

    if (record.length !== header.length) {
      const msg = record.length < header.length ? MSG_CSV_COLUMN_SHORT : MSG_CSV_COLUMN_OVER;
      errors.push({ line, message: formatString(msg, header.length, record.length) });
      continue;
    }

    const raw: Record<string, string> = Object.fromEntries(header.map((h, i) => [h, record[i]]));
    const parsed = ScheduleCsvSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const value = raw[String(issue.path[0])]?.trim();
        const message = value ? formatString(MSG_CSV_INPUT_VALUE, issue.message, value) : issue.message;
        errors.push({ line, message });
      }
      continue;
    }
    rows.push({ line, data: parsed.data });
  }

  /* 4.会社ID・店舗IDの存在チェック
  ------------------------------------------------------------------ */
  if (rows.length > 0) {
    const supabase = await createClient();
    const companyIds = [...new Set(rows.map((r) => r.data.t_companies_id))];
    const shopIds = [...new Set(rows.map((r) => r.data.t_shops_id))];
    const [companies, shops] = await Promise.all([
      supabase.from('t_companies').select('id').in('id', companyIds),
      supabase.from('t_shops').select('id').in('id', shopIds),
    ]);
    if (companies.error || shops.error) {
      console.error(companies.error ?? shops.error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '会社・店舗情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }
    const existCompanyIds = new Set(companies.data.map((c) => Number(c.id)));
    const existShopIds = new Set(shops.data.map((s) => Number(s.id)));
    for (const { line, data } of rows) {
      if (!existCompanyIds.has(data.t_companies_id)) {
        errors.push({ line, message: formatString(MSG_CSV_COMPANY_NOT_FOUND, data.t_companies_id) });
      }
      if (!existShopIds.has(data.t_shops_id)) {
        errors.push({ line, message: formatString(MSG_CSV_SHOP_NOT_FOUND, data.t_shops_id) });
      }
    }
  }

  if (errors.length > 0) {
    return throwCsvValidationError(errors);
  }
  return rows;
};

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
      /* 日付フォーマットの標準化 (タイムゾーンによるズレを防止)
      ------------------------------------------------------------------ */
      // DateオブジェクトからJST上の純粋な「年・月・日」の文字列を生成します。
      const year = item.delivery_day.getFullYear();
      const month = String(item.delivery_day.getMonth() + 1).padStart(2, '0');
      const day = String(item.delivery_day.getDate()).padStart(2, '0');
      const delivery_day_str = `${year}-${month}-${day}`;

      /* Select - t_menu_schedule
    　------------------------------------------------------------------ */
      // ★ 修正: $1 にタイムゾーンのブレがない YYYY-MM-DD 文字列を渡すように変更
      const selectSql = `
        SELECT id, t_shops_id
        FROM t_menu_schedule
        WHERE delivery_day = $1 AND t_companies_id = $2
        ORDER BY updated_at DESC
        LIMIT 1;
      `;

      const queryValues = [delivery_day_str, item.t_companies_id];
      const exData = await client.query<t_menu_schedule>(selectSql, queryValues);
      const row = exData.rows[0];

      if (row) {
        // 【配達日】と【会社ID】が一致する既存データがある場合
        if (Number(row.t_shops_id) === Number(item.t_shops_id)) {
          /* 1. 全てが一致する -> UPDATE */
          const updateValues: Omit<t_menu_schedule, 'id' | 't_companies_id' | 't_shops_id' | 'created_at'> = {
            delivery_day: delivery_day_str as any, // ★ DBへの型パースミスを防ぐため文字列で指定
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
          failedRows.push({
            delivery_day: delivery_day_str, // ★ 整形済みの綺麗な文字列をそのまま画面へ返す
            t_companies_id: item.t_companies_id,
            t_shops_id: item.t_shops_id,
            menu_name: item.menu_name,
          });
        }
      } else {
        /* 3. 一致するものが何もない場合 -> INSERT */
        const insertValues: Omit<t_menu_schedule, 'id' | 'created_at' | 'updated_at'> = {
          delivery_day: delivery_day_str as any, // ★ インサート時も文字列で安全に登録
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