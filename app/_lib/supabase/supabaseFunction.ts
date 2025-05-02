import { PostgrestSingleResponse } from '@supabase/supabase-js';

import {
  CompanyDetailFormValues,
  CompanySearchFormValues,
  ShopDetailFormValues,
  ShopSearchFormValues,
  UserSearchFormValues,
} from '@/app/_types/types';
import { pageMaxCount } from '@/app/_types/values';

import { getToday } from '../getDateTime';
import { getPostCodeAddHyphen } from '../utill';
import { supabase } from './supabase';
import { t_companies, t_shops, t_user } from './tableTypes';
import {
  ApiRequest,
  ApiResponse,
  SearchResult_CompanyList,
  SearchResult_ShopList,
  SearchResult_UserList,
} from './types';

const getRange = (nextPage: number) => {
  const startRange = (nextPage - 1) * pageMaxCount();
  const endRange = startRange + pageMaxCount() - 1;
  return { startRange, endRange };
};

const getPagenationsItems = (startRange: number, dataLength: number, count: number) => {
  const startRow = startRange + 1;
  const endRow = startRange + dataLength;
  const totalPage = (count ?? 0) > pageMaxCount() ? count / pageMaxCount() : 1;

  return { startRow, endRow, totalPage };
};

/* 会社一覧 検索
------------------------------------------------------------------ */
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
  if (req.usage_state) {
    query = query.eq('usage_state', req.usage_state);
    queryCount = queryCount.eq('usage_state', req.usage_state);
  }

  // ソート順序
  const sortConditions: Array<string> = ['company_name', 'branch_name', 'address', 'usage_state'];
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
      query = query.order(columnAdd, { ascending: values.sortItems?.ascending });
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

/* ユーザー一覧 検索
------------------------------------------------------------------ */
export const search_userList = async (
  values: ApiRequest<UserSearchFormValues>
): Promise<ApiResponse<SearchResult_UserList[]>> => {
  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);
  const req = values.request;

  let query = supabase
    .from('t_user')
    .select(`id,user_name,user_name_kana,t_companies_id,t_companies!inner(company_name)`)
    .range(startRange, endRange);
  let queryCount = supabase
    .from('t_user')
    .select(`id,user_name,user_name_kana,t_companies_id,t_companies!inner(company_name)`, {
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
  // 利用ステータス
  if (req.usage_state) {
    query = query.eq('usage_state', req.usage_state);
    queryCount = queryCount.eq('usage_state', req.usage_state);
  }

  // ソート順序 ※内部結合の項目は()で参照
  const sortConditions: Array<string> = ['user_name', 't_companies(company_name)'];

  // ソート初期値を確認
  const sortColumn = values.sortItems?.sortColumn === 'company_name' ? 't_companies(company_name)' : 'user_name';

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

/* 会社詳細 取得
------------------------------------------------------------------ */
export const get_companyDetail = async (values: ApiRequest<number>): Promise<ApiResponse<t_companies>> => {
  const query = supabase.from('t_companies').select('*').eq('id', values.request).single();
  const { data, error } = (await query) as PostgrestSingleResponse<t_companies>;

  return {
    data: data ?? null,
    error: error ? error.message : null,
  };
};

/* 会社詳細 新規登録
------------------------------------------------------------------ */
export const insert_companyDetail = async (
  values: ApiRequest<CompanyDetailFormValues>
): Promise<ApiResponse<number>> => {
  // TODO:ログをどこまで出したらいいんだろう

  const req = values.request;

  const { data: testData, error: testError } = await supabase.rpc('insert_companies', {
    companies: {
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
      memo: 'ソースだよ',
      usage_state: 0,
      optional_item_title_1: req.optional_item_title_1,
      optional_item_title_2: req.optional_item_title_2,
      optional_item_notes_1: req.optional_item_notes_1,
      optional_item_notes_2: req.optional_item_notes_2,
      url_key: '',
      offer_time_from: '10:00',
      offer_time_to: '11:00',
      order_period_day: Number(req.order_period_day),
      order_period_hour: Number(req.order_period_hour),
      order_period_minute: Number(req.order_period_minute),
      cancel_period_day: Number(req.cancel_period_day),
      cancel_period_hour: Number(req.cancel_period_hour),
      cancel_period_minute: Number(req.cancel_period_minute),
    },
    departments: [
      {
        department_name: 'あいうえお',
      },
      {
        department_name: 'かきくけこ',
      },
    ],
    employment_status: [],
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

  // 部署情報の新規登録
  // TASK:手動でのロールバックは厳しいなー！！！！！米山さんと長島さんと要相談
  // TASK:それはともあれ、SQL書いて実行できるか検証する必要はあると思いますだよ

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

/* 店舗詳細 取得
------------------------------------------------------------------ */
export const get_shopDetail = async (values: ApiRequest<number>): Promise<ApiResponse<t_shops>> => {
  const query = supabase.from('t_shops').select('*').eq('id', values.request).single();
  const { data, error } = (await query) as PostgrestSingleResponse<t_shops>;

  return {
    data: data ?? null,
    error: error ? error.message : null,
  };
};

/* 店舗詳細 新規登録
------------------------------------------------------------------ */
export const insert_shopDetail = async (values: ApiRequest<ShopDetailFormValues>): Promise<ApiResponse<number>> => {
  // TODO:ログをどこまで出したらいいんだろう

  const req = values.request;

  const query = supabase
    .from('t_shops')
    .insert<t_shops>({
      // MEMO:id:praimaryKeyなので自動追加
      shop_name: req.shop_name,
      shop_name_kana: req.shop_name_kana,
      shop_post_code: req.shop_post_code,
      shop_prefectures: req.shop_prefectures,
      shop_municipalities: req.shop_municipalities,
      shop_town_area: req.shop_town_area,
      shop_area_block_number: req.shop_area_block_number,
      shop_building_name: req.shop_building_name,
      tel_no: req.tel_no,
      mailaddress: req.mailaddress,
      specified_commercial_transaction_act: req.specified_commercial_transaction_act,
      shop_image: '', // TODO: 画像保存をどうするのか。
      memo: req.memo,
      usage_state: 0, // TODO: 店舗新規登録時、何のステータスを設定したらいいのか要確認。
      gmo_shop_code: '', // TODO: 店舗新規登録時、何を設定したらいいのか要確認。
      gmo_shop_password: '', // TODO: 店舗新規登録時、何を設定したらいいのか要確認。
      // updated_at: timestamp,　// MEMO:自動でタイムスタンプ押される。
      // created_at: timestamp,　// MEMO:自動でタイムスタンプ押される。
    })
    .select('id')
    .single();
  const { error, data } = (await query) as PostgrestSingleResponse<t_companies>;

  return {
    data: data?.id ? data.id : 0,
    error: error ? error.message : null,
  };
};

/* 店舗詳細 更新
------------------------------------------------------------------ */
export const update_shopDetail = async (values: ApiRequest<ShopDetailFormValues>): Promise<ApiResponse<number>> => {
  const req = values.request;

  const timestamp = getToday();
  console.log(timestamp);

  const query = supabase
    .from('t_shops')
    .update<t_shops>({
      // MEMO:id:praimaryKeyなので自動追加
      shop_name: req.shop_name,
      shop_name_kana: req.shop_name_kana,
      shop_post_code: req.shop_post_code,
      shop_prefectures: req.shop_prefectures,
      shop_municipalities: req.shop_municipalities,
      shop_town_area: req.shop_town_area,
      shop_area_block_number: req.shop_area_block_number,
      shop_building_name: req.shop_building_name,
      tel_no: req.tel_no,
      mailaddress: req.mailaddress,
      specified_commercial_transaction_act: req.specified_commercial_transaction_act,
      shop_image: '', // TODO: 画像保存をどうするのか。
      memo: req.memo,
      usage_state: 0, // TODO: 店舗新規登録時、何のステータスを設定したらいいのか要確認。
      gmo_shop_code: '', // TODO: 店舗新規登録時、何を設定したらいいのか要確認。
      gmo_shop_password: '', // TODO: 店舗新規登録時、何を設定したらいいのか要確認。
      updated_at: timestamp,
      // created_at: timestamp,　// MEMO:自動でタイムスタンプ押される。
    })
    .eq('id', req.id)
    .select('id')
    .single();
  const { error, data } = (await query) as PostgrestSingleResponse<t_companies>;

  return {
    data: data?.id ? data.id : 0,
    error: error ? error.message : null,
  };
};

/* 店舗一覧 検索
------------------------------------------------------------------ */
export const search_shopList = async (
  values: ApiRequest<ShopSearchFormValues>
): Promise<ApiResponse<SearchResult_ShopList[]>> => {
  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);
  const req = values.request;

  let query = supabase.from('t_shops').select('*').range(startRange, endRange);
  let queryCount = supabase.from('t_shops').select('*', { count: 'exact', head: true });

  // 店舗名
  if (req.shop_name) {
    query = query.ilike('shop_name', `%${req.shop_name}%`);
    queryCount = queryCount.ilike('shop_name', `%${req.shop_name}%`);
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
  if (req.usage_state) {
    query = query.eq('usage_state', req.usage_state);
    queryCount = queryCount.eq('usage_state', req.usage_state);
  }

  // ソート順序
  const sortConditions: Array<string> = ['shop_name', 'address', 'usage_state'];
  // ソート用住所
  const sortConditionsAddress: Array<string> = [
    'shop_post_code',
    'shop_prefectures',
    'shop_municipalities',
    'shop_town_area',
    'shop_area_block_number',
    'shop_building_name',
  ];

  const sortColumn = values.sortItems?.sortColumn ?? 'shop_name';

  // ソートの最優先項目を設定
  if (sortColumn === 'address') {
    for (const columnAdd of sortConditionsAddress) {
      query = query.order(columnAdd, { ascending: values.sortItems?.ascending });
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
  const { count, error: countError } = (await queryCount) as PostgrestSingleResponse<t_shops[]>;
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
  const { data, error } = (await query) as PostgrestSingleResponse<t_shops[]>;
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
    data: data.map((m) => {
      return {
        ...m,
        id: m.id ? m.id?.toString() : '',
        shop_post_code: m?.shop_post_code ? getPostCodeAddHyphen(m?.shop_post_code) : '',
        address:
          m.shop_prefectures +
          (m?.shop_municipalities ?? '') +
          m.shop_town_area +
          m.shop_area_block_number +
          m.shop_building_name,
        usage_state: m.usage_state?.toString(),
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

/* テスト用に作成した関数 ※のちすて
------------------------------------------------------------------ */
export type Todo = {
  id: number;
  title: string;
  isFlag: boolean;
};

export const getAllTodo = async () => {
  const todos: PostgrestSingleResponse<Todo[]> = await supabase.from('todo').select('*');
  return todos.data;
};

export const getAllTodoName = async () => {
  const todos: PostgrestSingleResponse<Pick<Todo, 'title'>[]> = await supabase.from('todo').select('title');
  return todos.data;
};
