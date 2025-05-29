import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { supabase } from '@/app/_lib/supabase/supabase';
import { getPagenationsItems, getRange } from '@/app/_lib/utill';
import { convertUsageStatusName, UsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
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
  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);

  let query = supabase.from('t_companies').select('*').range(startRange, endRange);
  let queryCount = supabase.from('t_companies').select('*', { count: 'exact', head: true });

  const req = values.request;

  // 会社名
  if (req.company_name) {
    query = query.ilike('company_name', `%${req.company_name}%`);
    queryCount = queryCount.ilike('company_name', `%${req.company_name}%`);
  }
  // 支店名
  if (req.branch_name) {
    query = query.ilike('branch_name', `%${req.branch_name}%`);
    queryCount = queryCount.ilike('branch_name', `%${req.branch_name}%`);
  }
  // 住所_都道府県
  if (req.prefectures) {
    query = query.eq('prefectures', req.prefectures);
    queryCount = queryCount.eq('prefectures', req.prefectures);
    // 住所_市区
    if (req.municipalities) {
      query = query.eq('municipalities', req.municipalities);
      queryCount = queryCount.eq('municipalities', req.municipalities);
      // 住所_町村
      if (req.town_area) {
        query = query.eq('town_area', req.town_area);
        queryCount = queryCount.eq('town_area', req.town_area);
      }
    }
  }
  // 利用ステータス
  if (req.usage_status) {
    query = query.eq('usage_status', req.usage_status);
    queryCount = queryCount.eq('usage_status', req.usage_status);
  }

  // ソート順序
  const sortConditions: Array<string> = ['company_name', 'branch_name', 'address', 'usage_status'];
  // ソート用住所
  const sortConditionsAddress: Array<string> = [
    'post_code',
    'prefectures',
    'municipalities',
    'town_area',
    'area_block_number',
    'building_name',
  ];

  const sortColumn = values.sortItems?.sortColumn ?? 'company_name';

  // ソートの最優先項目を設定
  if (sortColumn === 'address') {
    for (const columnAdd of sortConditionsAddress) {
      query = query.order(columnAdd, {
        ascending: values.sortItems?.ascending,
      });
    }
  } else {
    query = query.order(sortColumn, { ascending: values.sortItems?.ascending });
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

  // 件数取得
  const { count, error: countError }: PostgrestSingleResponse<CompanyListSearchResult[]> = await queryCount;
  if (countError) {
    console.log('countError', countError);
    return {
      data: null,
      error: countError.message,
      paginate: {
        count: 0,
        startRow: 0,
        endRow: 0,
        totalPage: 0,
        currentPage: 0,
      },
    };
  }

  // 明細行取得
  const { data, error }: PostgrestSingleResponse<CompanyListSearchResult[]> = await query;
  if (error) {
    console.log('error', error);
    return {
      data: null,
      error: error.message,
      paginate: {
        count: 0,
        startRow: 0,
        endRow: 0,
        totalPage: 0,
        currentPage: 0,
      },
    };
  }

  const resData: CompanyListSearchResult[] = data.map((m) => {
    return {
      ...m,
      usage_status: convertUsageStatusName(m.usage_status as UsageStatus),
    };
  });

  // 結果返却
  const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count ?? 0);
  return {
    data: resData,
    error: null,
    paginate: {
      count,
      startRow,
      endRow,
      totalPage,
      currentPage: values.sortItems?.nextPage ?? 0,
    },
  };
};
