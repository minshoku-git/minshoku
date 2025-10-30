import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient } from '@/app/_lib/supabase/server';
import { t_shops } from '@/app/_lib/supabase/tableTypes';
import { getPagenationsItems, getPostCodeAddHyphen, getRange } from '@/app/_lib/utils/utils';
import { convertUsageStatusName, UsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SortItems } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { ShopListSearchResult, ShopSearchFormValues } from './types';

/* 店舗一覧
------------------------------------------------------------------ */

/**
 * search_shopList
 * 検索条件に一致する会社情報を取得する。
 *
 * @param {ApiRequest<ShopSearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<ShopListSearchResult[]>>} 検索結果
 */
export const searchShopList = async (
  values: ApiRequest<ShopSearchFormValues>
): Promise<ApiResponse<ShopListSearchResult[]>> => {
  const supabase = await createClient();
  const req = values.request;
  const sortItems = values.sortItems;
  const { startRange, endRange } = getRange(sortItems?.nextPage ?? 0);

  try {
    /* 件数取得
    ------------------------------------------------------------------ */
    let queryCount = supabase.from('t_shops').select('*', { count: 'exact', head: true });
    queryCount = applyFilters(queryCount, req);

    const { count, error: countError } = (await queryCount) as PostgrestSingleResponse<t_shops[]>;
    if (countError) {
      console.error('countError', countError);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '店舗情報の件数取得' + ErrorCodes.NOT_FOUND.message,
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
    let query = supabase.from('t_shops').select('*').range(startRange, endRange);
    query = applyFilters(query, req);
    query = applySorts(query, sortItems);

    const { data, error } = (await query) as PostgrestSingleResponse<t_shops[]>;
    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '店舗情報の件数取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 返却
    ------------------------------------------------------------------ */
    const res: ShopListSearchResult[] = data.map((m) => {
      return {
        ...m,
        id: m.id!.toString(),
        shop_postal_code: m?.shop_postal_code ? getPostCodeAddHyphen(m?.shop_postal_code) : '',
        address: m.shop_address! + m.shop_area_block_number + m.shop_building_name,
        usage_status: convertUsageStatusName(m.usage_status as UsageStatus),
      };
    });

    const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count);
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
 * @param {ShopSearchFormValues} req
 * @returns {any} query 検索条件追加後のQuery
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyFilters = (query: any, req: ShopSearchFormValues): any => {
  // 店舗名
  if (req.shop_name) {
    query = query.or(`shop_name.ilike.%${req.shop_name}%, shop_name_kana.ilike.%${req.shop_name}%`);
  }
  // 住所(住所or番地or建物名)
  if (req.address) {
    query = query.or(
      `shop_address.ilike.%${req.address}%, shop_area_block_number.ilike.%${req.address}%, shop_building_name.ilike.%${req.address}%`
    );
  }
  // 利用ステータス
  if (req.usage_status !== undefined) {
    query = query.eq('usage_status', req.usage_status);
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
const applySorts = (query: any, sortItems: SortItems | undefined): any => {
  // ソート順序
  const sortConditions: Array<string> = ['shop_name', 'address', 'usage_status'];
  // ソート用住所
  const sortConditionsAddress: Array<string> = [
    'shop_postal_code',
    'shop_address',
    'shop_area_block_number',
    'shop_building_name',
  ];

  const sortColumn = sortItems?.sortColumn ?? 'shop_name';

  // ソートの最優先項目を設定
  if (sortColumn === 'address') {
    for (const columnAdd of sortConditionsAddress) {
      query = query.order(columnAdd, { ascending: sortItems?.ascending });
    }
  } else {
    query = query.order(sortColumn, { ascending: sortItems?.ascending });
  }

  // 2番目以降のソートを設定
  for (const column of sortConditions) {
    if (column !== sortColumn) {
      if (column === 'address') {
        for (const columnAdd of sortConditionsAddress) {
          query = query.order(columnAdd, { ascending: true });
        }
      } else {
        query = query.order(column, { ascending: true });
      }
    }
  }

  return query;
};
