import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { UserSearchFormValues } from '@/app/_types/types';

import { getPagenationsItems, getRange } from '../../utill';
import { supabase } from '../supabase';
import { ApiRequest, ApiResponse, SearchResult_UserList } from '../types';

/* ユーザー一覧
------------------------------------------------------------------ */

/**
 * search_userList
 * 検索条件に一致するユーザー情報を取得する。
 *
 * @param {ApiRequest<UserSearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<SearchResult_UserList[]>>} 検索結果
 */
export const search_userList = async (
  values: ApiRequest<UserSearchFormValues>
): Promise<ApiResponse<SearchResult_UserList[]>> => {
  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);
  const req = values.request;

  let query = supabase
    .from('t_user')
    .select(`id,user_name,user_name_kana,t_companies_id,t_companies!inner(company_name,branch_name)`)
    .range(startRange, endRange);
  let queryCount = supabase
    .from('t_user')
    .select(`id,user_name,user_name_kana,t_companies_id,t_companies!inner(company_name,branch_name)`, {
      count: 'exact',
      head: true,
    });

  // ユーザー名
  if (req.user_name) {
    query = query.ilike('user_name', `%${req.user_name}%`);
    queryCount = queryCount.ilike('user_name', `%${req.user_name}%`);
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
  if (req.usage_state) {
    query = query.eq('usage_state', req.usage_state);
    queryCount = queryCount.eq('usage_state', req.usage_state);
  }

  // ソート順序 ※内部結合の項目は()で参照
  const sortConditions: Array<string> = ['user_name', 't_companies(company_name)', 't_companies(branch_name)'];

  // ソート初期値を確認
  const sortColumn =
    values.sortItems?.sortColumn === 'user_name'
      ? 'user_name'
      : values.sortItems?.sortColumn === 'company_name'
        ? 't_companies(company_name)'
        : 't_companies(branch_name)';

  // ソートの最優先項目を設定
  query = query.order(sortColumn, { ascending: values.sortItems?.ascending });

  // 2番目以降のソートを設定
  for (const column of sortConditions) {
    if (column !== sortColumn) {
      query = query.order(column, { ascending: true });
    }
  }

  // 件数取得
  const { count, error: countError } = (await queryCount) as PostgrestSingleResponse<SearchResult_UserList[]>;
  if (countError) {
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
  const { data, error } = (await query) as PostgrestSingleResponse<SearchResult_UserList[]>;
  if (error) {
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
    data,
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
