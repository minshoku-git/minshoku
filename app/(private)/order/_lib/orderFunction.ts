import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getDateString, getDatetimeString, getNow } from '@/app/_lib/utils/getDateTime';
import { getPagenationsItems, getRange } from '@/app/_lib/utils/utils';
import { OrderStatusType, PaymentType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SortItems } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { alterTranGmo } from './gmoApi';
import {
  OrderCancelValues,
  OrderData,
  OrderDetailInitValues,
  orderDeteilCsvResponseData,
  orderDeteilResponseData,
  OrderListSearchResult,
  OrderSearchFormValues,
} from './types';

// Supabaseクエリから取得される、ネストされた生データ用の型定義
interface OrderCsvDbRow {
  id: number;
  delivery_day: string;
  count: number;
  list_price: number;
  amount: number;
  companies_burden_amount: number;
  user_burden_amount: number;
  payment_type: string | number;
  order_status_type: string;
  order_datetime: string;
  cancel_datetime: string | null;
  t_menu_schedule: {
    menu_name: string;
  };
  t_shops: {
    shop_name: string;
  };
  t_user: {
    id: number;
    user_name: string;
    user_name_kana: string;
    user_email: string;
    optional_item_answer_1: string | null;
    optional_item_answer_2: string | null;
  };
  t_companies: {
    id: number;
    company_name: string;
    branch_name: string;
    optional_item_title_1: string | null;
    optional_item_title_2: string | null;
  };
  t_companies_department: {
    department_name: string;
  };
  t_companies_employment_status: {
    employment_status_name: string;
  };
}

// 決済方法区分名をわかりやすい名称に変換
const getPaymentTypeName = (type: string | number | undefined | null): string => {
  if (type === undefined || type === null) return '';
  const strType = String(type);
  if (strType === String(PaymentType.SALAEY_DEDUCTIONS)) return '会社清算';
  if (strType === String(PaymentType.CREDITCARD)) return 'クレジットカード';
  if (strType === String(PaymentType.PAYPAY)) return 'PayPay';
  return strType;
};

// 注文ステータス名をわかりやすい名称に変換
const getOrderStatusName = (status: string | number | undefined | null): string => {
  if (status === undefined || status === null) return '';
  const strStatus = String(status);
  if (strStatus === String(OrderStatusType.VALID)) return '有効';
  if (strStatus === String(OrderStatusType.USER_CANCEL)) return 'キャンセル(ユーザー)';
  if (strStatus === String(OrderStatusType.SYSTEM_CANCEL)) return 'キャンセル(システム)';
  return strStatus;
};

/* オーダー一覧
------------------------------------------------------------------ */

/**
 * _searchOrderList
 * 検索条件に一致するオーダー情報を取得する。
 *
 * @param {ApiRequest<OrderSearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<OrderListSearchResult>>} 検索結果
 */
export const searchOrderList = async (
  values: ApiRequest<OrderSearchFormValues>
): Promise<ApiResponse<OrderListSearchResult>> => {
  const supabase = await createClient();
  const req = values.request;
  const sortItems = values.sortItems;
  const { startRange, endRange } = getRange(sortItems?.nextPage ?? 0);

  console.log('values.', values);

  try {
    /* 件数取得
    ------------------------------------------------------------------ */
    let queryCount = supabase
      .from('v_order_' + process.env.SUPABASE_DB_SCHEMA)
      .select('*', { count: 'exact', head: true });
    queryCount = applyFilters(queryCount, req);

    const { count, error: countError } = await queryCount;
    if (countError) {
      console.error('countError', countError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'オーダー情報の件数取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    if (!count) {
      return {
        success: true,
        data: { orderDatas: [] },
      };
    }

    /* 明細行取得
    ------------------------------------------------------------------ */
    let query = supabase
      .from('v_order_' + process.env.SUPABASE_DB_SCHEMA)
      .select(
        `
        id,
        t_menu_schedule_id,
        delivery_day,
        count,
        payment_type,
        order_status_type,
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
        ErrorCodes.DB_QUERY_FAILED.code,
        'オーダー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 返却
    ------------------------------------------------------------------ */
    const res: OrderData[] = data.map((m) => ({
      ...m,
      id: m.id!.toString(),
      delivery_day: getDateString(new Date(m.delivery_day)),
    }));

    const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count ?? 0);
    return {
      success: true,
      data: {
        orderDatas: res,
        paginate: {
          count,
          startRow,
          endRow,
          totalPage,
          currentPage: values.sortItems?.nextPage ?? 0,
        },
      },
    };
  } catch (e: unknown) {
    console.error(e);

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
  }
};

/**
 * createOrderListCsvData
 * 検索条件に一致するオーダー情報を取得し、CSVデータに成型する。
 *
 * @param {ApiRequest<OrderSearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<orderDeteilCsvResponseData[]>>} 検索結果
 */
export const createOrderListCsvData = async (
  values: ApiRequest<OrderSearchFormValues>
): Promise<ApiResponse<orderDeteilCsvResponseData[]>> => {
  const supabase = await createClient();
  const req = values.request;
  const sortItems = values.sortItems;

  try {
    /* 件数取得
    ------------------------------------------------------------------ */
    let queryCount = supabase
      .from('v_order_' + process.env.SUPABASE_DB_SCHEMA)
      .select('*', { count: 'exact', head: true });
    queryCount = applyFilters(queryCount, req);

    const { count, error: countError } = await queryCount;
    if (countError) {
      console.error('countError', countError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'オーダー情報の件数取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    if (!count) {
      return {
        success: true,
        data: [],
      };
    }

    /* 明細行取得(該当IDを取得)
    ------------------------------------------------------------------ */
    let query = supabase.from('v_order_' + process.env.SUPABASE_DB_SCHEMA).select('id');

    query = applyFilters(query, req);
    query = applySorts(query, sortItems);

    const { data, error } = await query;
    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'オーダー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 明細行取得(詳細)
    ------------------------------------------------------------------ */
    const ids: number[] = data.map((m) => m.id);
    const detailQuery = supabase
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
        order_status_type,
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
      .in('id', ids);
    
    // ネストデータを保持した DBRow として取得
    const { data: dataDetail, error: errorDetail } = (await detailQuery) as PostgrestSingleResponse<
      OrderCsvDbRow[]
    >;

    if (errorDetail) {
      console.error('query error', errorDetail);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'オーダー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 返却 (ネストデータを排除し、完全に平坦化してマッピングします)
    ------------------------------------------------------------------ */
    const res: orderDeteilCsvResponseData[] = dataDetail.map((m) => ({
      id: m.id,
      delivery_day: getDateString(new Date(m.delivery_day)),
      count: m.count ?? 0,
      list_price: m.list_price ?? 0,
      amount: m.amount ?? 0,
      companies_burden_amount: m.companies_burden_amount ?? 0,
      user_burden_amount: m.user_burden_amount ?? 0,
      payment_type: getPaymentTypeName(m.payment_type),
      order_status_type: getOrderStatusName(m.order_status_type),
      order_datetime: m.order_datetime ? getDatetimeString(new Date(m.order_datetime)) : '',
      cancel_datetime: m.cancel_datetime ? getDatetimeString(new Date(m.cancel_datetime)) : '',
      menu_name: m.t_menu_schedule?.menu_name ?? '',
      shop_name: m.t_shops?.shop_name ?? '',
      user_id: m.t_user?.id ?? '',
      user_name: m.t_user?.user_name ?? '',
      user_name_kana: m.t_user?.user_name_kana ?? '',
      user_email: m.t_user?.user_email ?? '',
      optional_item_answer_1: m.t_user?.optional_item_answer_1 ?? '',
      optional_item_answer_2: m.t_user?.optional_item_answer_2 ?? '',
      company_id: m.t_companies?.id ?? '',
      company_name: m.t_companies?.company_name ?? '',
      branch_name: m.t_companies?.branch_name ?? '',
      optional_item_title_1: m.t_companies?.optional_item_title_1 ?? '',
      optional_item_title_2: m.t_companies?.optional_item_title_2 ?? '',
      department_name: m.t_companies_department?.department_name ?? '',
      employment_status_name: m.t_companies_employment_status?.employment_status_name ?? '',
    }));

    return {
      success: true,
      data: res,
    };
  } catch (e: unknown) {
    console.error(e);

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
  
  // 納品日 (【修正箇所】UTCサーバーを考慮した日付判定)
  if (req.deliveryFrom) {
    query = query.gte('delivery_day', req.deliveryFrom.toISOString());
  }

  if (req.deliveryTo) {
    // サーバーのタイムゾーン(UTC等)に左右されないよう、
    // deliveryTo のミリ秒に「24時間引く1ミリ秒」を足して、その日の終わり(23:59:59.999)を表現する
    const endOfDay = new Date(req.deliveryTo.getTime() + 24 * 60 * 60 * 1000 - 1);
    query = query.lte('delivery_day', endOfDay.toISOString());
  }

  // 注文ステータス
  if (req.order_status_type) {
    query = query.eq('order_status_type', req.order_status_type);
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
    'order_status_type',
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
 * @param {ApiRequest<OrderDetailInitValues>} values - 検索条件
 * @returns {Promise<ApiResponse<orderDeteilResponseData>>} 検索結果
 */
export const searchOrderDetail = async (
  values: ApiRequest<OrderDetailInitValues>
): Promise<ApiResponse<orderDeteilResponseData>> => {
  const supabase = await createClient();
  const id = values.request.id;

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
        order_status_type,
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
        ErrorCodes.DB_QUERY_FAILED.code,
        'オーダー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 累計注文数
    ------------------------------------------------------------------ */
    const queryTotalOrderCount = supabase
      .from('t_order')
      .select('*', { count: 'exact', head: true })
      .eq('order_status_type', OrderStatusType.VALID);

    const { count: totalOrderCount, error: errorTotalOrderCount } =
      (await queryTotalOrderCount) as PostgrestSingleResponse<orderDeteilResponseData>;

    if (errorTotalOrderCount) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'オーダー情報(累計注文数)の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 前回注文日
    ------------------------------------------------------------------ */
    const queryLastOrderDateTime = supabase
      .from('t_order')
      .select('order_datetime')
      .eq('order_status_type', OrderStatusType.VALID)
      .eq('t_user_id', data.t_user.id)
      .order('order_datetime', { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: lastOrderDateTime, error: errorLastOrderDateTime } =
      (await queryLastOrderDateTime) as PostgrestSingleResponse<orderDeteilResponseData>;

    if (errorLastOrderDateTime) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'オーダー情報(前回注文日)の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
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
      payment_type: data.payment_type,
      order_status_type: data.order_status_type ?? OrderStatusType.VALID,
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
        error: e,
      };
    }
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * orderCancel
 * IDに一致するオーダー情報をキャンセルする。
 *
 * @param {ApiRequest<OrderCancelValues>} values - 検索条件
 * @returns {Promise<ApiResponse<orderDeteilResponseData>>} 検索結果
 */
export const orderCancel = async (values: ApiRequest<OrderCancelValues>): Promise<ApiResponse<number>> => {
  const timestamp = getNow();
  const id = values.request.id;

  // connection Start
  const client = await createPgClient();

  try {
    // Transaction Start
    await client.query('BEGIN');

    // 楽観排他処理
    const selectSql = `SELECT 
        id, 
        payment_type, 
        order_status_type, 
        credit_access_id, 
        credit_access_password 
      FROM t_order 
      WHERE id = $1 AND order_status_type = $2 FOR UPDATE`;
    const resultSelect = await client.query(selectSql, [id, OrderStatusType.VALID]);

    if (resultSelect.rowCount === 0) {
      throw new CustomError(ErrorCodes.CONFLICT);
    }

    const order = resultSelect.rows[0];

    /* GMO-PG 決済取消 (クレジットカードの場合)
  　------------------------------------------------------------------ */
    if (Number(order.payment_type) === Number(PaymentType.CREDITCARD)) {
      // 必要なIDが揃っているかチェック
      if (!order.credit_access_id || !order.credit_access_password) {
        throw new CustomError(
          ErrorCodes.INTERNAL_SERVER_ERROR.code,
          'GMOの決済情報(AccessID/Pass)がDBに見つかりません。',
          500
        );
      }

      // GMO API 呼び出し
      const gmoRes = await alterTranGmo(order.credit_access_id, order.credit_access_password);

      if (!gmoRes.success) {
        // GMO側でエラーが発生した場合は、DBの更新を行わずに例外を投げる（ロールバックされる）
        throw new CustomError(
          ErrorCodes.INTERNAL_SERVER_ERROR.code,
          `GMO決済取消に失敗しました。ErrInfo: ${gmoRes.errInfo}`,
          500
        );
      }
      console.log('GMO AlterTran Success:', id);
    }

    /* Update - t_order
  　------------------------------------------------------------------ */
    // UpdateData setting
    const updateSql = `
      UPDATE t_order 
      SET 
        order_status_type = $1, 
        updated_at = $2, 
        cancel_datetime = $3 
      WHERE id = $4 
      RETURNING id;
    `;
    // Update
    const result = await client.query(updateSql, [
      Number(OrderStatusType.SYSTEM_CANCEL),
      timestamp,
      timestamp,
      id,
    ]);

    if (result.rowCount === 0) {
      throw new CustomError({
        ...ErrorCodes.DB_QUERY_FAILED,
        message: 'オーダー情報の更新' + ErrorCodes.DB_QUERY_FAILED.message,
      });
    }
    const updatedId = result.rows[0]?.id;

    /* --------------------------------------------------------------- */
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