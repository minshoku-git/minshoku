import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getDateString, getNow } from '@/app/_lib/utils/getDateTime';
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

/**
 * Supabaseクエリから取得される、ネストされた生データ用の型定義
 */
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

/**
 * 決済方法区分名をわかりやすい名称に変換
 */
const getPaymentTypeName = (type: string | number | undefined | null): string => {
  if (type === undefined || type === null) return '';
  const strType = String(type);
  if (strType === String(PaymentType.SALAEY_DEDUCTIONS)) return '会社清算';
  if (strType === String(PaymentType.CREDITCARD)) return 'クレジットカード';
  if (strType === String(PaymentType.PAYPAY)) return 'PayPay';
  return strType;
};

/**
 * 注文ステータス名をわかりやすい名称に変換
 */
const getOrderStatusName = (status: string | number | undefined | null): string => {
  if (status === undefined || status === null) return '';
  const strStatus = String(status);
  if (strStatus === String(OrderStatusType.VALID)) return '有効';
  if (strStatus === String(OrderStatusType.USER_CANCEL)) return 'キャンセル(ユーザー)';
  if (strStatus === String(OrderStatusType.SYSTEM_CANCEL)) return 'キャンセル(システム)';
  return strStatus;
};

/**
 * Vercel(UTC)環境でも、確実に指定の日時を日本時間(JST)のフォーマット文字列に変換するヘルパー
 */
const toJstDateTimeString = (dateVal: Date | string | null | undefined): string => {
  if (!dateVal) return '';
  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  if (isNaN(d.getTime())) return '';

  return d.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(/\//g, '-');
};

/* オーダー一覧 ------------------------------------------------------------------ */

export const searchOrderList = async (
  values: ApiRequest<OrderSearchFormValues>
): Promise<ApiResponse<OrderListSearchResult>> => {
  const supabase = await createClient();
  const req = values.request;
  const sortItems = values.sortItems;
  const { startRange, endRange } = getRange(sortItems?.nextPage ?? 0);

  try {
    let queryCount = supabase
      .from('v_order_' + process.env.SUPABASE_DB_SCHEMA)
      .select('*', { count: 'exact', head: true });
    queryCount = applyFilters(queryCount, req);

    const { count, error: countError } = await queryCount;
    if (countError) {
      throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, '件数取得失敗', 500);
    }

    if (!count) return { success: true, data: { orderDatas: [] } };

    let query = supabase
      .from('v_order_' + process.env.SUPABASE_DB_SCHEMA)
      .select(`id, delivery_day, count, payment_type, order_status_type, company_name, branch_name, user_name, user_name_kana`)
      .range(startRange, endRange);
    query = applyFilters(query, req);
    query = applySorts(query, sortItems);

    const { data, error } = await query;
    if (error) throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, '明細取得失敗', 500);

    const res: OrderData[] = data.map((m) => ({
      ...m,
      id: m.id!.toString(),
      delivery_day: getDateString(new Date(m.delivery_day)),
    }));

    const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count ?? 0);
    return { success: true, data: { orderDatas: res, paginate: { count, startRow, endRow, totalPage, currentPage: sortItems?.nextPage ?? 0 } } };
  } catch (e: any) {
    return { success: false, error: e instanceof CustomError ? e : ErrorCodes.INTERNAL_SERVER_ERROR };
  }
};

export const createOrderListCsvData = async (
  values: ApiRequest<OrderSearchFormValues>
): Promise<ApiResponse<orderDeteilCsvResponseData[]>> => {
  const supabase = await createClient();
  const req = values.request;
  const sortItems = values.sortItems;

  try {
    let query = supabase.from('v_order_' + process.env.SUPABASE_DB_SCHEMA).select('id');
    query = applyFilters(query, req);
    query = applySorts(query, sortItems);
    const { data, error } = await query;
    if (error || !data) throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, 'ID取得失敗', 500);

    const ids = data.map((m) => m.id);
    const detailQuery = supabase
      .from('t_order')
      .select(`id, delivery_day, count, list_price, amount, companies_burden_amount, user_burden_amount, payment_type, order_status_type, order_datetime, cancel_datetime, t_menu_schedule!inner(menu_name), t_shops!inner(shop_name), t_user!inner(id, user_name, user_name_kana, user_email, optional_item_answer_1, optional_item_answer_2), t_companies!inner(id, company_name, branch_name, optional_item_title_1, optional_item_title_2), t_companies_department!inner(department_name), t_companies_employment_status!inner(employment_status_name)`)
      .in('id', ids);
    
    const { data: dataDetail, error: errorDetail } = (await detailQuery) as PostgrestSingleResponse<OrderCsvDbRow[]>;
    if (errorDetail) throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, '詳細取得失敗', 500);

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
      order_datetime: toJstDateTimeString(m.order_datetime),
      cancel_datetime: toJstDateTimeString(m.cancel_datetime),
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

    return { success: true, data: res };
  } catch (e: any) {
    return { success: false, error: e instanceof CustomError ? e : ErrorCodes.INTERNAL_SERVER_ERROR };
  }
};

const applyFilters = (query: any, req: OrderSearchFormValues) => {
  if (req.user_name) query = query.or(`user_name.ilike.%${req.user_name}%, user_name_kana.ilike.%${req.user_name}%`);
  if (req.company_name) query = query.or(`company_name.ilike.%${req.company_name}%, branch_name.ilike.%${req.company_name}%`);
  
  if (req.deliveryFrom) query = query.gte('delivery_day', req.deliveryFrom.toISOString());
  if (req.deliveryTo) {
    const endOfDay = new Date(req.deliveryTo.getTime() + 24 * 60 * 60 * 1000 - 1);
    query = query.lte('delivery_day', endOfDay.toISOString());
  }
  if (req.order_status_type) query = query.eq('order_status_type', req.order_status_type);
  return query;
};

const applySorts = (query: any, sortItems: SortItems | undefined) => {
  const sortColumn = sortItems?.sortColumn ?? 'delivery_day';
  query = query.order(sortColumn, { ascending: sortItems?.ascending ?? true });
  return query;
};

export const searchOrderDetail = async (
  values: ApiRequest<OrderDetailInitValues>
): Promise<ApiResponse<orderDeteilResponseData>> => {
  const supabase = await createClient();
  const id = values.request.id;

  try {
    const query = supabase
      .from('t_order')
      .select(`id, delivery_day, count, list_price, amount, companies_burden_amount, user_burden_amount, payment_type, order_status_type, order_datetime, cancel_datetime, t_menu_schedule!inner(menu_name), t_shops!inner(shop_name), t_user!inner(id, user_name, user_name_kana, user_email, optional_item_answer_1, optional_item_answer_2), t_companies!inner(id, company_name, branch_name, optional_item_title_1, optional_item_title_2), t_companies_department!inner(department_name), t_companies_employment_status!inner(employment_status_name)`)
      .eq('id', id)
      .single();
    const { data, error } = (await query) as PostgrestSingleResponse<orderDeteilResponseData>;
    if (error || !data) throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, '詳細取得失敗', 500);

    const queryLastOrder = supabase.from('t_order').select('order_datetime').eq('t_user_id', data.t_user.id).order('order_datetime', { ascending: false }).limit(1).maybeSingle();
    const { data: lastOrder } = await queryLastOrder;

    return {
      success: true,
      data: {
        ...data,
        id: data.id?.toString() ?? '',
        delivery_day: data.delivery_day ? getDateString(data.delivery_day as Date) : '',
        order_datetime: toJstDateTimeString(data.order_datetime),
        cancel_datetime: toJstDateTimeString(data.cancel_datetime),
        lastOrderDateTime: toJstDateTimeString(lastOrder?.order_datetime),
        totalOrderCount: 0, // 必要に応じて追加取得
      } as any,
    };
  } catch (e: any) {
    return { success: false, error: e instanceof CustomError ? e : ErrorCodes.INTERNAL_SERVER_ERROR };
  }
};

export const orderCancel = async (values: ApiRequest<OrderCancelValues>): Promise<ApiResponse<number>> => {
  const timestamp = getNow();
  const id = values.request.id;
  const client = await createPgClient();

  try {
    await client.query('BEGIN');
    const selectSql = `
      SELECT 
        o.id, 
        o.payment_type, 
        o.order_status_type, 
        o.credit_access_id, 
        o.credit_access_password,
        s.shop_name,
        s.gmo_shop_code,
        s.gmo_shop_password
      FROM t_order o
      INNER JOIN t_shops s ON o.t_shops_id = s.id
      WHERE o.id = $1 
      FOR UPDATE`;
    const resultSelect = await client.query(selectSql, [id]);
    const order = resultSelect.rows[0];

    if (!order) {
      throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, '対象の注文情報が見つかりません。', 404);
    }

    if (Number(order.payment_type) === Number(PaymentType.CREDITCARD)) {
      if (!order.gmo_shop_code || !order.gmo_shop_password) {
        throw new CustomError(
          ErrorCodes.INTERNAL_SERVER_ERROR.code,
          `店舗「${order.shop_name}」のGMO IDまたはGMO PASSが設定されていません。マスタ設定を確認してください。`,
          400
        );
      }

      const gmoRes = await alterTranGmo(
        order.credit_access_id, 
        order.credit_access_password,
        order.gmo_shop_code,
        order.gmo_shop_password
      );
      if (!gmoRes.success) throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR.code, `GMO失敗: ${gmoRes.errInfo}`, 500);
    }

    const updateSql = `UPDATE t_order SET order_status_type = $1, updated_at = $2, cancel_datetime = $3 WHERE id = $4 RETURNING id`;
    const result = await client.query(updateSql, [Number(OrderStatusType.SYSTEM_CANCEL), timestamp, timestamp, id]);
    
    await client.query('COMMIT');
    return { success: true, data: result.rows[0].id };
  } catch (e: any) {
    await rollbackWithLog(client);
    return { success: false, error: e instanceof CustomError ? e : ErrorCodes.INTERNAL_SERVER_ERROR };
  } finally {
    await client.end();
  }
};