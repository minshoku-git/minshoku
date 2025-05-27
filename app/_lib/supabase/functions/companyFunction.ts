import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { convertUsageStatusName, UsageStatus } from '@/app/_types/enum';
import { CompanyDetailFormValues, CompanySearchFormValues } from '@/app/_types/types';

import { DepartmentData, EmploymentData } from '../../createMockData';
import { convertTimeToDate, getPagenationsItems, getRange } from '../../utill';
import { supabase } from '../supabase';
import { t_companies, t_companies_department, t_companies_employment_status } from '../tableTypes';
import { ApiRequest, ApiResponse, SearchResult_CompanyList } from '../types';

/* 会社一覧
------------------------------------------------------------------ */

export const revalidate = 0;

/**
 * search_companyList
 * 検索条件に一致する会社情報を取得する。
 *
 * @param {ApiRequest<CompanySearchFormValues>} values - 検索条件
 * @returns {Promise<ApiResponse<SearchResult_CompanyList[]>>} 検索結果
 */
export const search_companyList = async (
  values: ApiRequest<CompanySearchFormValues>
): Promise<ApiResponse<SearchResult_CompanyList[]>> => {
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
  const { count, error: countError }: PostgrestSingleResponse<SearchResult_CompanyList[]> = await queryCount;
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
  const { data, error }: PostgrestSingleResponse<SearchResult_CompanyList[]> = await query;
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

  const resData: SearchResult_CompanyList[] = data.map((m) => {
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

/* 会社詳細  TODO: 没です！レビュー後、移動予定
------------------------------------------------------------------ */

/**
 * get_companyDetail
 * IDに一致する会社情報を取得する。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<ApiResponse<CompanyDetailFormValues>>} 検索結果
 */
export const get_companyDetail = async (values: ApiRequest<number>): Promise<ApiResponse<CompanyDetailFormValues>> => {
  // 1.会社情報取得
  const query = supabase.from('t_companies').select('*').eq('id', values.request).single();
  const { data, error } = (await query) as PostgrestSingleResponse<t_companies>;

  if (error) {
    console.log(error);
    return { data: null, error: error.message };
  }

  // 2.部署情報取得
  const queryDep = supabase
    .from('t_companies_department')
    .select('*')
    .eq('t_companies_id', values.request)
    .eq('delete_flag', 0)
    .order('id', { ascending: true });
  const { data: dataDep, error: errorDep } = (await queryDep) as PostgrestSingleResponse<t_companies_department[]>;

  if (errorDep) {
    console.log(errorDep);
    return { data: null, error: errorDep.message };
  }

  // 3.雇用種別情報取得
  const queryEmp = supabase
    .from('t_companies_employment_status')
    .select('*')
    .eq('t_companies_id', values.request)
    .eq('delete_flag', 0)
    .order('id', { ascending: true });
  const { data: dataEmp, error: errorEmp } = (await queryEmp) as PostgrestSingleResponse<
    t_companies_employment_status[]
  >;

  if (errorEmp) {
    console.log(errorEmp);
    return { data: null, error: errorEmp.message };
  }

  // Response set
  const depInit: DepartmentData[] = dataDep
    ? dataDep.map((m) => {
        return {
          id: m.id!.toString(),
          name: m.department_name ?? '',
          disabled: false,
          delete_flag: false,
        };
      })
    : [];

  const empInit: EmploymentData[] | null = dataEmp
    ? dataEmp.map((m) => {
        return {
          id: m.id!.toString(),
          t_companies_id: m.t_companies_id,
          employment_status_name: m.employment_status_name ?? '',
          disabled: true,
          deduction_flag: m.deduction_flag === 0 ? false : true,
          credit_flag: m.credit_flag === 0 ? false : true,
          paypay_flag: m.paypay_flag === 0 ? false : true,
          set_meal_burden: m.set_meal_burden ? m.set_meal_burden.toString() : '0',
          delete_flag: false,
        };
      })
    : [];

  console.log(data.usage_status);

  const res: CompanyDetailFormValues = {
    id: data.id?.toString(),
    company_name: data.company_name ?? '',
    branch_name: data.branch_name ?? '',
    post_code: data.post_code ?? '',
    prefectures: data.prefectures ?? '',
    municipalities: data.municipalities ?? '',
    town_area: data.town_area ?? '',
    area_block_number: data.area_block_number ?? '',
    building_name: data.building_name ?? '',
    restaurant_name: data.restaurant_name ?? '',
    location: data.location ?? '',
    mailaddress: data.mailaddress ?? '',
    memo: data.memo ?? '',
    optional_item_title_1: data.optional_item_title_1 ?? '',
    optional_item_title_2: data.optional_item_title_2 ?? '',
    optional_item_notes_1: data.optional_item_notes_1 ?? '',
    optional_item_notes_2: data.optional_item_notes_2 ?? '',
    offer_time_from: data.offer_time_from ? convertTimeToDate(data.offer_time_from) : null,
    offer_time_to: data.offer_time_to ? convertTimeToDate(data.offer_time_to) : null,
    order_period_day: data.order_period_day?.toString() ?? '',
    order_period_time: data.order_period_time ? convertTimeToDate(data.order_period_time) : null,
    cancel_period_day: data.cancel_period_day?.toString() ?? '',
    cancel_period_time: data.cancel_period_time ? convertTimeToDate(data.cancel_period_time) : null,
    departmentInfo: depInit,
    employmentStatusInfo: empInit,
    usage_status: data.usage_status,
  };

  console.log(res);

  return {
    data: data ? res : null,
    error: null,
  };
};

/**
 * insert_companyDetail
 * 会社情報を新規登録する。
 *
 * @param {ApiRequest<CompanyDetailFormValues>} values - 入力情報
 * @returns {Promise<ApiResponse<number>>} 新規登録した会社情報ID
 */
export const insert_companyDetail = async (
  values: ApiRequest<CompanyDetailFormValues>
): Promise<ApiResponse<number>> => {
  const req = values.request;

  const { data: testData, error: testError } = await supabase.rpc('testtest', {
    departments: ['てすと'], // trigger_errorを加えるとエラーを発生させることができます
    employment_status: [],
    t_companies: {
      company_name: req.company_name,
      branch_name: req.branch_name,
      post_code: req.post_code,
      prefectures: req.prefectures,
      municipalities: req.municipalities,
      town_area: req.town_area,
      area_block_number: req.area_block_number,
      building_name: req.building_name,
      restaurant_name: req.restaurant_name,
      location: req.location,
      mailaddress: req.mailaddress,
      memo: req.memo,
      usage_state: 0,
      optional_item_title_1: req.optional_item_title_1,
      optional_item_title_2: req.optional_item_title_2,
      optional_item_notes_1: req.optional_item_notes_1,
      optional_item_notes_2: req.optional_item_notes_2,
      url_key: '', // TODO: 仕様確定待ち
      offer_time_from: req.offer_time_from,
      offer_time_to: req.offer_time_to,
      order_period_day: Number(req.order_period_day),
      order_period_time: req.order_period_time,
      cancel_period_day: Number(req.cancel_period_day),
      cancel_period_time: req.order_period_time,
    },
  });

  // const query = supabase
  //   .from('t_companies')
  //   .insert<t_companies>({
  //     // MEMO:id:praimaryKeyなので自動追加
  //     company_name: req.company_name,
  //     branch_name: req.branch_name,
  //     post_code: req.post_code,
  //     prefectures: req.prefectures,
  //     municipalities: req.municipalities,
  //     town_area: req.town_area,
  //     area_block_number: req.area_block_number,
  //     building_name: req.building_name,
  //     restaurant_name: req.restaurant_name,
  //     mailaddress: req.mailaddress,
  //     memo: req.memo,
  //     usage_state: 0, // TODO: 企業新規登録時、何を設定したらいいのか要確認。
  //     optional_item_title_1: req.optional_item_title_1,
  //     optional_item_title_2: req.optional_item_title_2,
  //     optional_item_notes_1: req.optional_item_notes_1,
  //     optional_item_notes_2: req.optional_item_notes_2,
  //     url_key: '', // TODO: 企業新規登録時、何を設定したらいいのか要確認。
  //     offer_time_from: '00:00', // TODO:timeで管理する？文字列かnumberにする？
  //     offer_time_to: '12:00', // TODO:timeで管理する？文字列かnumberにする？
  //     order_period_day: Number(req.order_period_day),
  //     order_period_hour: Number(req.order_period_hour),
  //     order_period_minute: Number(req.order_period_minute),
  //     cancel_period_day: Number(req.cancel_period_day),
  //     cancel_period_hour: Number(req.cancel_period_hour),
  //     cancel_period_minute: Number(req.cancel_period_minute),
  //     // updated_at: timestamp,　// MEMO:自動でタイムスタンプ押される。
  //     // created_at: timestamp,　// MEMO:自動でタイムスタンプ押される。
  //   })
  //   .select('id')
  //   .single();
  // const { error, data } = (await query) as PostgrestSingleResponse<t_companies>;

  // 企業雇用形態の新規登録

  console.log(testData);
  console.log(testError?.message);

  return {
    data: (testData as number) ?? null,
    error: testError ? testError.message : null,
  };

  // return {
  //   data: data?.id ? data.id : 0,
  //   error: error ? error.message : null,
  // };
};
