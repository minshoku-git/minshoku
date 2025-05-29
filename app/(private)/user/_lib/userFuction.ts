import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { supabase } from '@/app/_lib/supabase/supabase';
import { getPagenationsItems, getRange } from '@/app/_lib/utill';
import { convertUserUsageStatusName, UserUsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { UserListSearchResult, UserSearchFormValues } from './types';

/* ユーザー一覧
------------------------------------------------------------------ */
/**
 * search_userList
 * 検索条件に一致するユーザー情報を取得する。
 *
 * @param {ApiRequest<UserSearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<UserListSearchResult[]>>} - 検索結果
 */
export const _searchUserList = async (
  values: ApiRequest<UserSearchFormValues>
): Promise<ApiResponse<UserListSearchResult[]>> => {
  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);
  const req = values.request;

  let query = supabase
    .from('t_user')
    .select(`id,user_name,user_name_kana,user_usage_status,t_companies_id,t_companies!inner(company_name,branch_name)`)
    .range(startRange, endRange);
  let queryCount = supabase
    .from('t_user')
    .select(
      `id,user_name,user_name_kana,user_usage_status,t_companies_id,t_companies!inner(company_name,branch_name)`,
      {
        count: 'exact',
        head: true,
      }
    );

  // ユーザー名
  if (req.user_name) {
    query = query.or(`user_name.ilike.%${req.user_name}%, user_name_kana.ilike.%${req.user_name}%`);
    queryCount = queryCount.or(`user_name.ilike.%${req.user_name}%, user_name_kana.ilike.%${req.user_name}%`);
  }
  // 会社名
  if (req.company_name) {
    query = query.ilike('t_companies.company_name', `%${req.company_name}%`);
    queryCount = queryCount.ilike('t_companies.company_name', `%${req.company_name}%`);
  }
  // 支店名
  if (req.branch_name) {
    query = query.ilike('t_companies.branch_name', `%${req.branch_name}%`);
    queryCount = queryCount.ilike('t_companies.branch_name', `%${req.branch_name}%`);
  }
  // 利用ステータス
  if (req.user_usage_status) {
    query = query.eq('user_usage_status', req.user_usage_status);
    queryCount = queryCount.eq('user_usage_status', req.user_usage_status);
  }

  // ソート順序 ※内部結合の項目は()で参照
  const sortConditions: Array<string> = [
    'user_name',
    't_companies(company_name)',
    't_companies(branch_name)',
    'user_usage_status',
  ];

  // ソート初期値を確認
  const sortColumn =
    values.sortItems?.sortColumn === 'user_name'
      ? 'user_name'
      : values.sortItems?.sortColumn === 'company_name'
        ? 't_companies(company_name)'
        : values.sortItems?.sortColumn === 'branch_name'
          ? 't_companies(branch_name)'
          : 'user_usage_status';

  // ソートの最優先項目を設定
  query = query.order(sortColumn, { ascending: values.sortItems?.ascending });

  // 2番目以降のソートを設定
  for (const column of sortConditions) {
    if (column !== sortColumn) {
      query = query.order(column, { ascending: true });
    }
  }

  // 件数取得
  const { count, error: countError } = (await queryCount) as PostgrestSingleResponse<UserListSearchResult[]>;
  if (countError) {
    console.log(countError.message);
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
  const { data, error } = (await query) as PostgrestSingleResponse<UserListSearchResult[]>;
  if (error) {
    console.log(error.message);
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

  // 結果返却
  const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count ?? 0);

  return {
    data: data.map((m) => {
      return {
        ...m,
        user_usage_status: convertUserUsageStatusName(m.user_usage_status as UserUsageStatus),
      };
    }),
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
