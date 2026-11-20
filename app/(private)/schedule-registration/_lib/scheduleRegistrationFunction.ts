import { CsvError, parse } from 'csv-parse/sync';

import {
  MSG_CSV_CANCELED_SHOP_HAS_ORDERS,
  MSG_CSV_COLUMN_OVER,
  MSG_CSV_COLUMN_SHORT,
  MSG_CSV_COMPANY_NOT_FOUND,
  MSG_CSV_DUPLICATE_ROW,
  MSG_CSV_FORMAT,
  MSG_CSV_HEADER_MISSING,
  MSG_CSV_HEADER_UNKNOWN,
  MSG_CSV_INPUT_VALUE,
  MSG_CSV_NO_DATA,
  MSG_CSV_OTHER_SHOP_ACTIVE,
  MSG_CSV_OTHER_SHOP_ACTIVE_REVIVE,
  MSG_CSV_ROW,
  MSG_CSV_SHOP_NOT_FOUND,
} from '@/app/_config/constants';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_menu_schedule } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow } from '@/app/_lib/utils/getDateTime';
import { formatString, getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { OrderStatusType, ScheduleCancelFlag } from '@/app/_types/enum';
import { ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import {
  BlockingOrder,
  FailedScheduleRow,
  SCHEDULE_CSV_COLUMNS,
  SCHEDULE_CSV_OPTIONAL_COLUMNS,
  ScheduleCsvRow,
  ScheduleCsvSchema,
  ScheduleRegistrationResult,
} from './types';

/* CSV解析・検証
------------------------------------------------------------------ */

/** 行番号付きのエラー（行順に並べ替えてから表示するため） */
type CsvLineError = { line: number; message: string };

/**
 * 納品日を YYYY-MM-DD 形式の文字列にする（タイムゾーンによる日付のズレを防ぐため、DB検索・登録はこの文字列で行う）
 *
 * @param {Date} date - 納品日
 * @returns {string} YYYY-MM-DD
 */
const toDeliveryDayString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  const optionalColumns: string[] = SCHEDULE_CSV_OPTIONAL_COLUMNS;
  const headerErrors: CsvLineError[] = [
    ...columns
      .filter((c) => !header.includes(c) && !optionalColumns.includes(c))
      .map((c) => formatString(MSG_CSV_HEADER_MISSING, c)),
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

  /* 3-2.CSV内の重複チェック（同じ納品日・会社ID・店舗IDの行が複数あると、どちらを採用するか決まらないため）
  ------------------------------------------------------------------ */
  const firstLineByKey = new Map<string, number>();
  for (const { line, data } of rows) {
    const key = `${toDeliveryDayString(data.delivery_day)}_${data.t_companies_id}_${data.t_shops_id}`;
    const firstLine = firstLineByKey.get(key);
    if (firstLine !== undefined) {
      errors.push({ line, message: formatString(MSG_CSV_DUPLICATE_ROW, firstLine) });
    } else {
      firstLineByKey.set(key, line);
    }
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

/** pgクライアント */
type PgClient = Awaited<ReturnType<typeof createPgClient>>;

/** 同じ納品日・会社IDの既存スケジュール */
type ExistingSchedule = { id: string; t_shops_id: string; cancel_flag: string | null };

/**
 * selectActiveOrders
 * 指定したスケジュールに紐づく有効な注文（ユーザーキャンセル・システムキャンセル以外）を取得する。
 *
 * @param {PgClient} client - pgクライアント（トランザクション中のもの）
 * @param {number[]} scheduleIds - スケジュールID一覧
 * @returns {Promise<(BlockingOrder & { t_menu_schedule_id: number })[]>} 有効な注文一覧（注文ID順）
 */
const selectActiveOrders = async (
  client: PgClient,
  scheduleIds: number[]
): Promise<(BlockingOrder & { t_menu_schedule_id: number })[]> => {
  const sql = `
    SELECT
      o.id,
      o.t_menu_schedule_id,
      COALESCE(u.user_name, '') AS user_name,
      o.count,
      to_char(o.order_datetime AT TIME ZONE 'Asia/Tokyo', 'YYYY/MM/DD HH24:MI') AS order_datetime
    FROM t_order o
    LEFT JOIN t_user u ON u.id = o.t_user_id
    WHERE o.t_menu_schedule_id = ANY($1::bigint[])
      AND o.order_status_type NOT IN ($2, $3)
    ORDER BY o.id;`;
  const result = await client.query(sql, [scheduleIds, OrderStatusType.USER_CANCEL, OrderStatusType.SYSTEM_CANCEL]);
  return result.rows.map((r) => ({
    id: Number(r.id),
    t_menu_schedule_id: Number(r.t_menu_schedule_id),
    user_name: r.user_name,
    count: Number(r.count),
    order_datetime: r.order_datetime ?? '',
  }));
};

/**
 * RefreshingScheduleData
 * スケジュール情報をルールに基づいて登録・更新・除外する。
 *
 * 判定は「納品日＋会社ID」単位で行い、1つの会社に1日1店舗（有効なもの）だけを登録できる。
 * 1. 同じ店舗のスケジュールがある → 更新（ただし別の店舗が有効な日は、キャンセルの解除はできない）
 * 2. 別の店舗のスケジュールが有効 → 登録対象外
 * 3. 別の店舗のスケジュールがすべてキャンセル済み → 有効な注文が残っていなければ新規登録、残っていれば登録対象外（注文を画面に表示）
 * 4. 何もない → 新規登録
 *
 * @param {ScheduleCsvRow[]} rows - 検証済みのスケジュールデータ（行番号付き）
 * @returns {Promise<ApiResponse<ScheduleRegistrationResult>>} 登録件数と登録できなかった行
 */
export const RefreshingScheduleData = async (
  rows: ScheduleCsvRow[]
): Promise<ApiResponse<ScheduleRegistrationResult>> => {
  const now = getNow();
  const client = await createPgClient();

  // 成功件数と失敗行を保持するコンテナ
  const failedRows: FailedScheduleRow[] = [];
  let successCount = 0;

  // キャンセル（cancel_flag=1）の行を先に処理する。
  // 同じCSVで「元の店舗をキャンセル」と「別の店舗を登録」をした場合に、行の並び順に関係なく別の店舗を登録できるようにするため
  const sortedRows = [...rows].sort(
    (a, b) =>
      Number(b.data.cancel_flag === ScheduleCancelFlag.CANCELED) -
      Number(a.data.cancel_flag === ScheduleCancelFlag.CANCELED)
  );

  try {
    await client.query('BEGIN');

    for (const { line, data: item } of sortedRows) {
      const deliveryDay = toDeliveryDayString(item.delivery_day);

      /**
       * 登録対象外として画面へ返却する
       * @param {string} reason - 理由
       * @param {BlockingOrder[]} orders - 登録の妨げになっている注文
       */
      const pushFailed = (reason: string, orders?: BlockingOrder[]) => {
        failedRows.push({
          line,
          delivery_day: deliveryDay,
          t_companies_id: item.t_companies_id,
          t_shops_id: item.t_shops_id,
          menu_name: item.menu_name,
          reason,
          orders,
        });
      };

      /* Select - 同じ納品日・会社IDの既存スケジュール
      ------------------------------------------------------------------ */
      const selectSql = `
        SELECT id, t_shops_id, cancel_flag
        FROM t_menu_schedule
        WHERE delivery_day = $1 AND t_companies_id = $2
        ORDER BY updated_at DESC;
      `;
      const existing = (await client.query<ExistingSchedule>(selectSql, [deliveryDay, item.t_companies_id])).rows;
      const sameShop = existing.find((s) => Number(s.t_shops_id) === item.t_shops_id);
      const otherShops = existing.filter((s) => Number(s.t_shops_id) !== item.t_shops_id);
      const activeOtherShop = otherShops.find((s) => s.cancel_flag !== ScheduleCancelFlag.CANCELED);

      if (sameShop) {
        /* 1. 同じ店舗のスケジュールがある -> UPDATE
        ------------------------------------------------------------------ */
        if (item.cancel_flag === ScheduleCancelFlag.ACTIVE && activeOtherShop) {
          // キャンセルを解除すると、同じ日に有効な店舗が2つになってしまうため
          pushFailed(formatString(MSG_CSV_OTHER_SHOP_ACTIVE_REVIVE, activeOtherShop.t_shops_id));
          continue;
        }
        const updateValues: Omit<t_menu_schedule, 'id' | 't_companies_id' | 't_shops_id' | 'created_at'> = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delivery_day: deliveryDay as any, // DBへの型パースミスを防ぐため文字列で指定
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
          WHERE id = $${columns.length + 1}
          RETURNING id;`;
        const result = await client.query(updateScheduleSql, [...updateParams, sameShop.id]);
        if (result.rowCount === 0) {
          throw new CustomError(
            ErrorCodes.DB_QUERY_FAILED.code,
            'スケジュール情報の登録処理' + ErrorCodes.DB_QUERY_FAILED.message,
            ErrorCodes.DB_QUERY_FAILED.status
          );
        }
        successCount++;
        continue;
      }

      if (activeOtherShop) {
        /* 2. 別の店舗のスケジュールが有効 -> 登録対象外
        ------------------------------------------------------------------ */
        pushFailed(formatString(MSG_CSV_OTHER_SHOP_ACTIVE, activeOtherShop.t_shops_id));
        continue;
      }

      if (otherShops.length > 0) {
        /* 3. 別の店舗のスケジュールがすべてキャンセル済み -> 有効な注文が残っていれば登録対象外
        ------------------------------------------------------------------ */
        const orders = await selectActiveOrders(
          client,
          otherShops.map((s) => Number(s.id))
        );
        if (orders.length > 0) {
          const shopIds = [
            ...new Set(orders.map((o) => otherShops.find((s) => Number(s.id) === o.t_menu_schedule_id)?.t_shops_id)),
          ];
          pushFailed(
            formatString(MSG_CSV_CANCELED_SHOP_HAS_ORDERS, shopIds.join('、'), orders.length),
            orders.map(({ t_menu_schedule_id, ...order }) => order)
          );
          continue;
        }
      }

      /* 4. 登録可能 -> INSERT
      ------------------------------------------------------------------ */
      const insertValues: Omit<t_menu_schedule, 'id' | 'created_at' | 'updated_at'> = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delivery_day: deliveryDay as any, // インサート時も文字列で安全に登録
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
        throw new CustomError(
          ErrorCodes.DB_QUERY_FAILED.code,
          'スケジュール情報の登録処理' + ErrorCodes.DB_QUERY_FAILED.message,
          ErrorCodes.DB_QUERY_FAILED.status
        );
      }
      successCount++;
    }

    // 登録対象外の行以外を確定させる
    await client.query('COMMIT');
    console.log('Transaction completed. Success:', successCount, 'Failed:', failedRows.length);

    return {
      success: true,
      data: {
        successCount,
        failedRows: failedRows.sort((a, b) => a.line - b.line),
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
