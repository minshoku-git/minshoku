import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { supabase } from '@/app/_lib/supabase/supabase';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { DetailResult_UserData } from './types';

/* ユーザー詳細
------------------------------------------------------------------ */

/**
 * get_userDetail
 * IDに一致する店舗情報を取得する。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<ApiResponse<t_user>>} 検索結果
 */
export const _searchUserDetail = async (values: ApiRequest<number>): Promise<ApiResponse<DetailResult_UserData>> => {
  const query = supabase
    .from('t_user')
    .select(
      `id,
      user_name,
      user_name_kana,
      user_usage_status,
      user_email,
      master_memo,
      t_companies_id,
      t_companies!inner(
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
      )`
    )
    .eq('id', values.request)
    .single();

  const { data, error } = (await query) as PostgrestSingleResponse<DetailResult_UserData>;
  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data,
    error: null,
  };
};
