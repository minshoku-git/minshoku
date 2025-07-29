import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { getDateString, getDatetimeString, getNow } from '@/app/_lib/getDateTime';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getPagenationsItems, getRange } from '@/app/_lib/utill';
import { OrderStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SortItems } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { orderDeteilResponseData, OrderListSearchResult, OrderSearchFormValues } from './types';

/* オーダー一覧
------------------------------------------------------------------ */

/**
 * _searchOrderList
 * 検索条件に一致するオーダー情報を取得する。
 *
 * @param {ApiRequest<OrderSearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<OrderListSearchResult>>} 検索結果
 */
export const _searchOrderList = async (
  values: ApiRequest<OrderSearchFormValues>
): Promise<ApiResponse<OrderListSearchResult[]>> => {
  const supabase = await createClient();
  const req = values.request;
  const sortItems = values.sortItems;
  const { startRange, endRange } = getRange(sortItems?.nextPage ?? 0);

  try {
    /* 件数取得
    ------------------------------------------------------------------ */
    let queryCount = supabase.from('v_order').select('*', { count: 'exact', head: true });
    queryCount = applyFilters(queryCount, req);

    const { count, error: countError } = await queryCount;
    if (countError) {
      console.error('countError', countError);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'オーダー情報の件数取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    if (!count) {
      return {
        success: true,
        data: [],
        paginate: {
          count: 0,
          startRow: 0,
          endRow: 0,
          totalPage: 0,
          currentPage: 0,
        },
      };
    }

    /* 明細行取得
    ------------------------------------------------------------------ */
    let query = supabase
      .from('v_order')
      .select(
        `
        id,
        t_menu_schedule_id,
        delivery_day,
        count,
        payment_type,
        order_status,
        company_name,
        branch_name,
        user_name,
        user_name_kana
      `
      )
      .range(startRange, endRange);
    query = applyFilters(query, req);
    query = applySorts(query, sortItems);

    const { data, error } = await query;
    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'オーダー情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 返却
    ------------------------------------------------------------------ */
    const res: OrderListSearchResult[] = data.map((m) => ({
      ...m,
      id: m.id!.toString(),
      delivery_day: getDateString(new Date(m.delivery_day)),
    }));

    const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count ?? 0);
    return {
      success: true,
      data: res,
      paginate: {
        count,
        startRow,
        endRow,
        totalPage,
        currentPage: values.sortItems?.nextPage ?? 0,
      },
    };
  } catch (e: unknown) {
    console.error(e);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  }
};

/**
 * 検索条件を設定します。
 * @param {any} query - Query
 * @param {OrderSearchFormValues} req
 * @returns {any} query 検索条件追加後のQuery
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyFilters = (query: any, req: OrderSearchFormValues) => {
  // ユーザー名;
  if (req.user_name) {
    query = query.or(`user_name.ilike.%${req.user_name}%, user_name_kana.ilike.%${req.user_name}%`);
  }
  // 会社名・支店名
  if (req.company_name) {
    query = query.or(`company_name.ilike.%${req.company_name}%, branch_name.ilike.%${req.company_name}%`);
  }
  // 納品日
  if (req.deliveryFrom && req.deliveryTo) {
    query = query.gte('delivery_day', req.deliveryFrom).lte('delivery_day', req.deliveryTo);
  } else if (req.deliveryFrom) {
    query = query.gte('delivery_day', req.deliveryFrom);
  } else if (req.deliveryTo) {
    query = query.lte('delivery_day', req.deliveryTo);
  }
  // 注文ステータス
  if (req.order_status) {
    query = query.eq('order_status', req.order_status);
  }

  return query;
};

/**
 * ソート条件を設定します。
 * @param {query} query - Query
 * @param {sortItems | undefined} sortItems - ソート条件
 * @returns {any} query 検索条件追加後のQuery
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applySorts = (query: any, sortItems: SortItems | undefined) => {
  // ソート順序
  const sortConditions: Array<string> = [
    'delivery_day',
    'user_name',
    'company_name',
    'count',
    'payment_type',
    'order_status',
  ];
  // ソート用会社名
  const sortConditionsCompanyName: Array<string> = ['company_name', 'branch_name'];

  const sortColumn = sortItems?.sortColumn ?? 'delivery_day';

  // ソートの最優先項目を設定
  if (sortColumn === 'company_name') {
    for (const columnAdd of sortConditionsCompanyName) {
      query = query.order(columnAdd, { ascending: sortItems?.ascending ?? true });
    }
  } else {
    query = query.order(sortColumn, { ascending: sortItems?.ascending ?? true });
  }

  // 2番目以降のソートを設定
  for (const column of sortConditions) {
    if (column !== sortColumn) {
      if (column === 'company_name') {
        for (const columnAdd of sortConditionsCompanyName) {
          query = query.order(columnAdd, { ascending: true });
        }
      } else {
        query = query.order(column, { ascending: true });
      }
    }
  }

  return query;
};

/**
 * _searchOrderList
 * IDに一致するオーダー情報を取得する。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<ApiResponse<orderDeteilResponseData>>} 検索結果
 */
export const _searchOrderDetail = async (values: ApiRequest<number>): Promise<ApiResponse<orderDeteilResponseData>> => {
  const supabase = await createClient();
  const id = values.request;

  try {
    const query = supabase
      .from('t_order')
      .select(
        `id,
        delivery_day,
        count,
        list_price,
        amount,
        companies_burden_amount,
        user_burden_amount,
        payment_type,
        order_status,
        order_datetime,
        cancel_datetime,
        t_menu_schedule!inner(
          menu_name
        ),
        t_shops!inner(
          shop_name
        ),
        t_user!inner(
          id,
          user_name,
          user_name_kana,
          user_email,
          optional_item_answer_1,
          optional_item_answer_2
        ),
        t_companies!inner(
          id,
          company_name,
          branch_name,
          optional_item_title_1,
          optional_item_title_2
        ),
        t_companies_department!inner(
          department_name
        ),
        t_companies_employment_status!inner(
          employment_status_name
        )
        `
      )
      .eq('id', id)
      .single();
    const { data, error } = (await query) as PostgrestSingleResponse<orderDeteilResponseData>;

    if (error || !data) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'オーダー情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 累計注文数
    ------------------------------------------------------------------ */
    const queryTotalOrderCount = supabase
      .from('t_order')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', OrderStatus.VALID);

    const { count: totalOrderCount, error: errorTotalOrderCount } =
      (await queryTotalOrderCount) as PostgrestSingleResponse<orderDeteilResponseData>;

    if (errorTotalOrderCount) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'オーダー情報(累計注文数)の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 前回注文日
    ------------------------------------------------------------------ */
    const queryLastOrderDateTime = supabase
      .from('t_order')
      .select('order_datetime')
      .eq('order_status', OrderStatus.VALID)
      .eq('t_user_id', data.t_user.id)
      .order('order_datetime', { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: lastOrderDateTime, error: errorLastOrderDateTime } =
      (await queryLastOrderDateTime) as PostgrestSingleResponse<orderDeteilResponseData>;

    if (errorLastOrderDateTime) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'オーダー情報(前回注文日)の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 返却
    ------------------------------------------------------------------ */
    const res: orderDeteilResponseData = {
      id: data.id?.toString() ?? '',
      delivery_day: data.delivery_day ? getDateString(data.delivery_day as Date) : '',
      count: data.count ?? 0,
      list_price: data.list_price ?? 0,
      amount: data.amount ?? 0,
      companies_burden_amount: data.companies_burden_amount,
      user_burden_amount: data.user_burden_amount,
      payment_type: data.payment_type ?? 0,
      order_status: data.order_status ?? 0,
      order_datetime: data.order_datetime ? getDatetimeString(data.order_datetime as Date) : '',
      cancel_datetime: data.cancel_datetime ? getDatetimeString(data.cancel_datetime as Date) : '',
      totalOrderCount: totalOrderCount ?? 0,
      lastOrderDateTime: lastOrderDateTime?.order_datetime
        ? getDatetimeString(lastOrderDateTime.order_datetime as Date)
        : '',
      t_menu_schedule: {
        menu_name: data.t_menu_schedule.menu_name,
      },
      t_shops: {
        shop_name: data.t_shops.shop_name,
      },
      t_user: {
        id: data.t_user.id,
        user_name: data.t_user.user_name,
        user_name_kana: data.t_user.user_name_kana,
        user_email: data.t_user.user_email,
        optional_item_answer_1: data.t_user.optional_item_answer_1 ?? '',
        optional_item_answer_2: data.t_user.optional_item_answer_2 ?? '',
      },
      t_companies: {
        id: data.t_companies.id,
        company_name: data.t_companies.company_name,
        branch_name: data.t_companies.branch_name,
        optional_item_title_1: data.t_companies.optional_item_title_1,
        optional_item_title_2: data.t_companies.optional_item_title_2,
      },
      t_companies_department: {
        department_name: data.t_companies_department.department_name,
      },
      t_companies_employment_status: {
        employment_status_name: data.t_companies_employment_status.employment_status_name,
      },
    };

    return {
      success: true,
      data: res,
    };
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};

/**
 * _orderCancel
 * IDに一致するオーダー情報をキャンセルする。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<ApiResponse<orderDeteilResponseData>>} 検索結果
 */
export const _orderCancel = async (values: ApiRequest<number>): Promise<ApiResponse<number>> => {
  const client = createPgClient();
  const timestamp = getNow();
  const id = values.request;

  // ステータスをキャンセルに更新
  try {
    // connection Start
    await client.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await client.query('BEGIN');

    // 楽観排他処理
    const selectSql = `SELECT id FROM t_order WHERE id = $1 AND order_status = $2`;
    const resultSelect = await client.query(selectSql, [id, OrderStatus.VALID]);

    if (resultSelect.rowCount === 0) {
      throw new CustomError(ErrorCodes.CONFLICT);
    }

    /* Update - t_order
  　------------------------------------------------------------------ */
    // UpdateData setting
    const updateSql = `UPDATE t_order SET order_status = $1, updated_at = $2, cancel_datetime = $3 WHERE id = $4 AND order_status = $5;`;
    // Update
    const result = await client.query(updateSql, [OrderStatus.CANCEL, timestamp, timestamp, id, OrderStatus.VALID]);
    if (result.rowCount === 0) {
      throw new CustomError({
        ...ErrorCodes.NOT_FOUND,
        message: 'オーダー情報の更新' + ErrorCodes.NOT_FOUND.message,
      });
    }
    const updatedId = result.rows[0]?.id;

    /* Update - GMO
  　------------------------------------------------------------------ */

    // TASK: GMO連携後に処理追加予定

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await client.query('COMMIT');
    console.log('Transaction completed, Update user ID:', updatedId);

    // Response setting
    return { success: true, data: updatedId };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    await rollbackWithLog(client);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  } finally {
    // Transaction End
    await client.end();
  }
};
