import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient } from '@/app/_lib/supabase/server';
import { getDateString } from '@/app/_lib/utils/getDateTime';
import { getPagenationsItems, getRange } from '@/app/_lib/utils/utils';
import { ApiRequest, ApiResponse, SortItems } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { ScheduleData, ScheduleListSearchResult, ScheduleSearchFormValues } from './types';

/* スケジュール一覧
------------------------------------------------------------------ */

/**
 * searchScheduleList
 * 検索条件に一致するスケジュール情報を取得する。
 *
 * @param {ApiRequest<ScheduleSearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<ScheduleListSearchResult>>} 検索結果
 */
export const searchScheduleList = async (
  values: ApiRequest<ScheduleSearchFormValues>
): Promise<ApiResponse<ScheduleListSearchResult>> => {
  const supabase = await createClient();
  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);
  const req = values.request;
  const sortItems = values.sortItems;

  try {
    /* 件数取得
  ------------------------------------------------------------------ */
    let queryCount = supabase
      .from('v_menu_schedule_' + process.env.SUPABASE_DB_SCHEMA)
      .select('*', { count: 'exact', head: true });
    queryCount = applyFilters(queryCount, req);

    const { count, error: countError } = (await queryCount) as PostgrestSingleResponse<ScheduleData[]>;
    if (countError) {
      console.log('countError', countError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'スケジュール情報の件数取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }
    if (!count) {
      return {
        success: true,
        data: { orderAmout: 0, scheduleDatas: [] },
      };
    }
    console.log('スケジュール件数の取得結果:', count);

    /* 明細行取得
  ------------------------------------------------------------------ */
    let query = supabase
      .from('v_menu_schedule_' + process.env.SUPABASE_DB_SCHEMA)
      .select(
        `id,
      delivery_day,
      company_name,
      branch_name,
      shop_name,
      menu_name,
      stock_count
      `
      )
      .range(startRange, endRange);
    query = applyFilters(query, req);
    query = applySorts(query, sortItems);

    const { data, error } = (await query) as PostgrestSingleResponse<ScheduleData[]>;
    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'スケジュール情報の件数取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 納品数合計
  ------------------------------------------------------------------ */
    // MEMO:
    // VIEWにはSUM()が使用不可のため、該当レコードの納品数を取得し、合計数を算出する。
    let orderCountQuery = supabase.from('v_menu_schedule_' + process.env.SUPABASE_DB_SCHEMA).select('stock_count');
    orderCountQuery = applyFilters(orderCountQuery, req);
    const { data: orderCountData, error: orderCountError } = (await orderCountQuery) as PostgrestSingleResponse<ScheduleData[]>;

    if (orderCountError) {
      console.log('orderAmountError', orderCountError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '納品数合計の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    const totalOrderCount = orderCountData?.reduce((acc, item) => acc + item.stock_count, 0) ?? 0;

    console.log('スケジュール一覧納品数合計:', totalOrderCount);

    /* 返却
    ------------------------------------------------------------------ */
    const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count ?? 0);

    const res: ScheduleListSearchResult = {
      orderAmout: totalOrderCount,
      scheduleDatas: data.map((m) => {
        return {
          ...m,
          id: m.id!.toString(),
          delivery_day: getDateString(new Date(m.delivery_day)),
          sum: totalOrderCount,
        };
      }),
      paginate: {
        count,
        startRow,
        endRow,
        totalPage,
        currentPage: values.sortItems?.nextPage ?? 0,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyFilters = (query: any, req: ScheduleSearchFormValues) => {
  // 会社名・支店名
  if (req.company_name) {
    query = query.or(`company_name.ilike.%${req.company_name}%, branch_name.ilike.%${req.company_name}%`);
  }
  // 店舗名・店舗名かな;
  if (req.shop_name) {
    query = query.or(`shop_name.like.%${req.shop_name}%, shop_name_kana.ilike.%${req.shop_name}%`);
  }

  // 納品日
  if (req.deliveryFrom) {
    query = query.gte('delivery_day', req.deliveryFrom.toISOString());
  }

  if (req.deliveryTo) {
    // サーバーのタイムゾーン(UTC等)に左右されないよう、
    // deliveryTo (その日の 00:00) から「24時間引く1ミリ秒」を足して、その日の終わりを作る
    const endOfDay = new Date(req.deliveryTo.getTime() + 24 * 60 * 60 * 1000 - 1);
    query = query.lte('delivery_day', endOfDay.toISOString());
  }

  // // 納品日
  // if (req.deliveryFrom && req.deliveryTo) {
  //   const endOfDay = new Date(req.deliveryTo);
  //   endOfDay.setHours(23, 59, 59, 999);
  //   query = query.gte('delivery_day', req.deliveryFrom.toISOString()).lte('delivery_day', endOfDay.toISOString());
  // } else if (req.deliveryFrom) {
  //   query = query.gte('delivery_day', req.deliveryFrom.toISOString());
  // } else if (req.deliveryTo) {
  //   const endOfDay = new Date(req.deliveryTo);
  //   endOfDay.setHours(23, 59, 59, 999);
  //   query = query.lte('delivery_day', endOfDay.toISOString());
  // }

  return query;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applySorts = (query: any, sortItems: SortItems | undefined) => {
  // ソート順序
  const sortConditions: Array<string> = ['delivery_day', 'company_name', 'shop_name', 'menu_name', 'stock_count'];
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
