import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient } from '@/app/_lib/supabase/server';
import { getPagenationsItems, getPostCodeAddHyphen, getRange } from '@/app/_lib/utill';
import { ERROR_MESSAGE } from '@/app/_types/constants';
import { convertUsageStatusName, UsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SortItems } from '@/app/_types/types';
import { CompanyListSearchResult, CompanySearchFormValues } from '@/app/(private)/company/_lib/types';

/* 会社一覧
------------------------------------------------------------------ */
/**
 * search_companyList
 * 検索条件に一致する会社情報を取得する。
 *
 * @param {ApiRequest<CompanySearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<CompanyListSearchResult[]>>} 検索結果
 */
export const _searchComponyList = async (
  values: ApiRequest<CompanySearchFormValues>
): Promise<ApiResponse<CompanyListSearchResult[]>> => {
  const supabase = await createClient();

  const req = values.request;
  const sortItems = values.sortItems;
  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);

  try {
    /* 件数取得
    ------------------------------------------------------------------ */
    let queryCount = supabase.from('t_companies').select('*', { count: 'exact', head: true });
    queryCount = applyFilters(queryCount, req);

    const { count, error: countError }: PostgrestSingleResponse<CompanyListSearchResult[]> = await queryCount;

    if (countError) {
      console.error(countError);
      return { error: '会社情報の件数取得' + ERROR_MESSAGE.TEMPLATE };
    }
    if (!count) {
      return {
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
    let query = supabase.from('t_companies').select('*').range(startRange, endRange);
    query = applyFilters(query, req);
    query = applySorts(query, sortItems);

    const { data, error }: PostgrestSingleResponse<CompanyListSearchResult[]> = await query;

    if (error) {
      console.error(error);
      return { error: '会社情報の取得' + ERROR_MESSAGE.TEMPLATE };
    }

    /* 返却
    ------------------------------------------------------------------ */
    const resData: CompanyListSearchResult[] = data.map((m) => {
      return {
        ...m,
        postal_code: getPostCodeAddHyphen(m.postal_code),
        usage_status: convertUsageStatusName(m.usage_status.toString() as UsageStatus),
      };
    });

    const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count ?? 0);

    return {
      data: resData,
      paginate: {
        count,
        startRow,
        endRow,
        totalPage,
        currentPage: values.sortItems?.nextPage ?? 0,
      },
    };
  } catch (error) {
    console.error(error);
    return { error: ERROR_MESSAGE.UNEXPECTED };
  }
};

/**
 * 検索条件を設定します。
 * @param {any} query - Query
 * @param {ShopSearchFormValues} req
 * @returns {any} query 検索条件追加後のQuery
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyFilters = (query: any, req: CompanySearchFormValues): any => {
  // 会社名
  if (req.company_name) {
    query = query.ilike('company_name', `%${req.company_name}%`);
  }
  // 支店名
  if (req.branch_name) {
    query = query.ilike('branch_name', `%${req.branch_name}%`);
  }
  // 住所(住所or番地or建物名)
  if (req.address) {
    query = query.or(
      `address.ilike.%${req.address}%, area_block_number.ilike.%${req.address}%, building_name.ilike.%${req.address}%`
    );
    console.log(query);
  }
  // 利用ステータス
  if (req.usage_status) {
    query = query.eq('usage_status', Number(req.usage_status));
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
  const sortConditions: Array<string> = ['company_name', 'branch_name', 'address', 'usage_status'];
  // ソート用住所
  const sortConditionsAddress: Array<string> = ['postal_code', 'address', 'area_block_number', 'building_name'];

  const sortColumn = sortItems?.sortColumn ?? 'company_name';

  // ソートの最優先項目を設定
  if (sortColumn === 'address') {
    for (const columnAdd of sortConditionsAddress) {
      query = query.order(columnAdd, {
        ascending: sortItems?.ascending,
      });
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
