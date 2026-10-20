import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { DB_FETCH_MAX_ROWS } from '@/app/_config/constants';
import { createClient } from '@/app/_lib/supabase/server';
import { getPagenationsItems, getRange } from '@/app/_lib/utils/utils';
import {
  convertUsageStatusName,
  convertUserRegistrationStatusName,
  UsageStatus,
  UserRegistrationStatus,
} from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SortItems } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { UserCsvData, UserCsvDbRow, UserData, UserListSearchResult, UserSearchFormValues } from './types';

/* ユーザー一覧
------------------------------------------------------------------ */
/**
 * search_userList
 * 検索条件に一致するユーザー情報を取得する。
 *
 * @param {ApiRequest<UserSearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<UserListSearchResult>>} - 検索結果
 */
export const searchUserList = async (
  values: ApiRequest<UserSearchFormValues>
): Promise<ApiResponse<UserListSearchResult>> => {
  const supabase = await createClient();

  const req = values.request;
  const sortItems = values.sortItems;
  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);

  try {
    /* 件数取得
    ------------------------------------------------------------------ */
    let queryCount = supabase.from('t_user').select(
      `id,
        user_name,
        user_name_kana,
        user_registration_status,
        usage_status,
        t_companies_id,
        t_companies!inner(
          company_name,
          branch_name
        )`,
      {
        count: 'exact',
        head: true,
      }
    );
    queryCount = applyFilters(queryCount, req);

    const { count, error: countError } = (await queryCount) as PostgrestSingleResponse<UserData[]>;

    if (countError) {
      console.error('countError', countError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の件数取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }
    if (!count) {
      return {
        success: true,
        data: {
          userDatas: [],
        },
      };
    }

    /* 明細行取得
    ------------------------------------------------------------------ */
    let query = supabase
      .from('t_user')
      .select(
        `id,
        user_name,
        user_name_kana,
        user_registration_status,
        usage_status,t_companies_id,
        t_companies!inner(
          company_name,
          branch_name
        )`
      )
      .range(startRange, endRange);
    query = applyFilters(query, req);
    query = applySorts(query, sortItems);

    const { data, error } = (await query) as PostgrestSingleResponse<UserData[]>;
    if (error) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 返却
    ------------------------------------------------------------------ */
    const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count);

    return {
      success: true,
      data: {
        userDatas: data.map((m) => {
          return {
            ...m,
            user_registration_status: convertUserRegistrationStatusName(
              m.user_registration_status as UserRegistrationStatus
            ),
            usage_status: convertUsageStatusName(m.usage_status as UsageStatus),
          };
        }),
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

/* ユーザー一覧 CSV出力
------------------------------------------------------------------ */
/**
 * createUserListCsvData
 * 検索条件に一致するユーザー情報を全件取得し、CSV出力用の形式に変換する。
 * ページングに関係なく全件を、一覧と同じ並び順で返す。列はユーザー詳細画面の表示順。
 *
 * @param {ApiRequest<UserSearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<UserCsvData[]>>} - CSV出力データ
 */
export const createUserListCsvData = async (
  values: ApiRequest<UserSearchFormValues>
): Promise<ApiResponse<UserCsvData[]>> => {
  const supabase = await createClient();
  const req = values.request;
  const sortItems = values.sortItems;

  try {
    /* 全件取得（PostgRESTの1回あたりの取得上限を超えるため分割して取得）
    ------------------------------------------------------------------ */
    const rows: UserCsvDbRow[] = [];
    for (let start = 0; ; start += DB_FETCH_MAX_ROWS) {
      let query = supabase
        .from('t_user')
        .select(
          `id,
          user_name,
          user_name_kana,
          user_email,
          user_registration_status,
          usage_status,
          master_memo,
          optional_item_answer_1,
          optional_item_answer_2,
          t_companies!inner(
            company_name,
            branch_name,
            optional_item_title_1,
            optional_item_title_2
          ),
          t_companies_department(
            department_name
          ),
          t_companies_employment_status(
            employment_status_name
          )`
        )
        .range(start, start + DB_FETCH_MAX_ROWS - 1);
      query = applyFilters(query, req);
      query = applySorts(query, sortItems);
      // 分割取得で行が重複・欠落しないよう、最後にIDで並びを一意にする
      query = query.order('id', { ascending: true });

      const { data, error } = (await query) as PostgrestSingleResponse<UserCsvDbRow[]>;
      if (error) {
        console.error(error);
        throw new CustomError(
          ErrorCodes.DB_QUERY_FAILED.code,
          'ユーザー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
          ErrorCodes.DB_QUERY_FAILED.status
        );
      }
      rows.push(...data);
      if (data.length < DB_FETCH_MAX_ROWS) break;
    }

    /* CSV形式に変換
    ------------------------------------------------------------------ */
    const csvData: UserCsvData[] = rows.map((m) => ({
      ユーザーID: String(m.id),
      ユーザー名: m.user_name ?? '',
      'ユーザー名(カナ)': m.user_name_kana ?? '',
      メールアドレス: m.user_email ?? '',
      会社名: m.t_companies?.company_name ?? '',
      支店名: m.t_companies?.branch_name ?? '',
      部署名: m.t_companies_department?.department_name ?? '',
      雇用形態名: m.t_companies_employment_status?.employment_status_name ?? '',
      任意項目1_項目名: m.t_companies?.optional_item_title_1 ?? '',
      任意項目1_回答: m.optional_item_answer_1 ?? '',
      任意項目2_項目名: m.t_companies?.optional_item_title_2 ?? '',
      任意項目2_回答: m.optional_item_answer_2 ?? '',
      登録ステータス: convertUserRegistrationStatusName(m.user_registration_status as UserRegistrationStatus) ?? '',
      メモ: m.master_memo ?? '',
      利用ステータス: convertUsageStatusName(m.usage_status as UsageStatus) ?? '',
    }));

    return { success: true, data: csvData };
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
 * @param {UserSearchFormValues} req
 * @returns {any} query 検索条件追加後のQuery
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyFilters = (query: any, req: UserSearchFormValues) => {
  // ユーザー名
  if (req.user_name) {
    query = query.or(`user_name.ilike.%${req.user_name}%, user_name_kana.ilike.%${req.user_name}%`);
  }
  // 会社名
  if (req.company_name) {
    query = query.ilike('t_companies.company_name', `%${req.company_name}%`);
  }
  // 支店名
  if (req.branch_name) {
    query = query.ilike('t_companies.branch_name', `%${req.branch_name}%`);
  }
  // 利用ステータス
  if (req.usage_status !== undefined) {
    query = query.eq('usage_status', req.usage_status);
  }
  // 登録ステータス
  if (req.user_registration_status) {
    query = query.eq('user_registration_status', req.user_registration_status);
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
  // ソート順序 ※内部結合の項目は()で参照
  const sortConditions: Array<string> = [
    'user_name',
    't_companies(company_name)',
    't_companies(branch_name)',
    'usage_status',
    'user_registration_status',
  ];

  // ソート初期値を確認
  const sortColumn =
    sortItems?.sortColumn === 'user_name'
      ? 'user_name'
      : sortItems?.sortColumn === 'company_name'
        ? 't_companies(company_name)'
        : sortItems?.sortColumn === 'branch_name'
          ? 't_companies(branch_name)'
          : sortItems?.sortColumn === 'usage_status'
            ? 'usage_status'
            : 'user_registration_status';

  // ソートの最優先項目を設定
  query = query.order(sortColumn, { ascending: sortItems?.ascending });

  // 2番目以降のソートを設定
  for (const column of sortConditions) {
    if (column !== sortColumn) {
      query = query.order(column, { ascending: true });
    }
  }

  return query;
};
