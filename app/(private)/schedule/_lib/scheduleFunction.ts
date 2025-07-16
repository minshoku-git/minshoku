import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { getDateString } from '@/app/_lib/getDateTime';
import { createClient } from '@/app/_lib/supabase/server';
import { getPagenationsItems, getRange } from '@/app/_lib/utill';
import { ApiRequest, ApiResponse, SortItems } from '@/app/_types/types';

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
export const _searchScheduleList = async (
  values: ApiRequest<ScheduleSearchFormValues>
): Promise<ApiResponse<ScheduleListSearchResult>> => {
  const supabase = await createClient();

  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);
  const req = values.request;
  const sortItems = values.sortItems;

  /* 件数取得
  ------------------------------------------------------------------ */
  let queryCount = supabase.from('v_menu_schedule').select('*', { count: 'exact', head: true });
  queryCount = applyFilters(queryCount, req);

  const { count, error: countError } = (await queryCount) as PostgrestSingleResponse<ScheduleData[]>;
  if (countError) {
    console.log('countError', countError);
    return {
      error: countError.message,
    };
  }
  if (!count) {
    return {
      paginate: {
        count: 0, // 0件で処理終了
        startRow: 0,
        endRow: 0,
        totalPage: 0,
        currentPage: 0,
      },
    };
  }
  console.log('スケジュール件数の取得結果:', count);

  /* 明細行取得
  ------------------------------------------------------------------ */
  let query = supabase
    .from('v_menu_schedule')
    .select(
      `id,
      delivery_day,
      company_name,
      branch_name,
      shop_name,
      menu_name,
      order_count,
      allergen_labelling
      `
    )
    .range(startRange, endRange);
  query = applyFilters(query, req);
  query = applySorts(query, sortItems);

  const { data, error } = (await query) as PostgrestSingleResponse<ScheduleData[]>;
  if (error) {
    console.log('error', error);
    return {
      error: error.message,
    };
  }
  console.log('スケジュール一覧の取得結果:', data);

  /* 納品数合計
  ------------------------------------------------------------------ */
  // MEMO:
  // VIEWにはSUM()が使用不可のため、該当レコードの納品数を取得し、合計数を算出する。
  let orderCountQuery = supabase.from('v_menu_schedule').select('order_count');
  orderCountQuery = applyFilters(orderCountQuery, req);
  const { data: orderCountData, error: orderCountError } = (await query) as PostgrestSingleResponse<ScheduleData[]>;

  if (orderCountError) {
    console.log('orderAmountError', orderCountError);
    return {
      error: orderCountError.message,
    };
  }

  const totalOrderCount = orderCountData.reduce((acc, item) => acc + item.order_count, 0);

  console.log('スケジュール一覧納品数合計:', totalOrderCount);

  /* 返却
  ------------------------------------------------------------------ */
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
  };

  // 結果返却
  const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count ?? 0);
  return {
    data: res,
    paginate: {
      count,
      startRow,
      endRow,
      totalPage,
      currentPage: values.sortItems?.nextPage ?? 0,
    },
  };
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
  if (req.deliveryFrom && req.deliveryTo) {
    query = query.gte('delivery_day', req.deliveryFrom).lte('delivery_day', req.deliveryTo);
  } else if (req.deliveryFrom) {
    query = query.gte('delivery_day', req.deliveryFrom);
  } else if (req.deliveryTo) {
    query = query.lte('delivery_day', req.deliveryTo);
  }

  return query;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applySorts = (query: any, sortItems: SortItems | undefined) => {
  // ソート順序
  const sortConditions: Array<string> = [
    'delivery_day',
    'company_name',
    'shop_name',
    'menu_name',
    'order_count',
    'allergen_labelling',
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
