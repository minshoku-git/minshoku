import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { getNow } from '@/app/_lib/getDateTime';
import { supabase } from '@/app/_lib/supabase/supabase';
import { t_companies, t_shops } from '@/app/_lib/supabase/tableTypes';
import { getPagenationsItems, getPostCodeAddHyphen, getRange } from '@/app/_lib/utill';
import { convertUsageStatusName, UsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { ShopDetailFormValues } from '../../shopDetail/[id]/_lib/types';
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
export const _searchShopList = async (
  values: ApiRequest<ShopSearchFormValues>
): Promise<ApiResponse<ShopListSearchResult[]>> => {
  const { startRange, endRange } = getRange(values.sortItems?.nextPage ?? 0);
  const req = values.request;

  let query = supabase.from('t_shops').select('*').range(startRange, endRange);
  let queryCount = supabase.from('t_shops').select('*', { count: 'exact', head: true });

  // 店舗名
  if (req.shop_name) {
    query = query.or(`shop_name.ilike.%${req.shop_name}%, shop_name_kana.ilike.%${req.shop_name}%`);
    queryCount = queryCount.or(`shop_name.ilike.%${req.shop_name}%, shop_name_kana.ilike.%${req.shop_name}%`);
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
  const sortConditions: Array<string> = ['shop_name', 'address', 'usage_status'];
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
  const { data, error } = (await query) as PostgrestSingleResponse<t_shops[]>;
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

  const res: ShopListSearchResult[] = data.map((m) => {
    return {
      ...m,
      id: m.id!.toString(),
      shop_post_code: m?.shop_post_code ? getPostCodeAddHyphen(m?.shop_post_code) : '',
      address:
        m.shop_prefectures +
        (m?.shop_municipalities ?? '') +
        m.shop_town_area +
        m.shop_area_block_number +
        m.shop_building_name,
      usage_status: convertUsageStatusName(m.usage_status as UsageStatus),
    };
  });

  // 結果返却
  const { startRow, endRow, totalPage } = getPagenationsItems(startRange, data.length, count ?? 0);
  return {
    data: res,
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

/* 店舗詳細
------------------------------------------------------------------ */

/**
 * _searchShopDetail
 * IDに一致する店舗情報を取得する。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<ApiResponse<t_shops>>} 検索結果
 */
export const _searchShopDetail = async (values: ApiRequest<number>): Promise<ApiResponse<t_shops>> => {
  const query = supabase.from('t_shops').select('*').eq('id', values.request).single();
  const { data, error } = (await query) as PostgrestSingleResponse<t_shops>;

  return {
    data: data ?? null,
    error: error ? error.message : null,
  };
};

/**
 * insert_companyDetail
 * 店舗情報を新規登録する。
 *
 * @param {ApiRequest<ShopDetailFormValues>} values - 入力情報
 * @returns {Promise<ApiResponse<number>>} 新規登録した店舗情報ID
 */
export const _insertShopDetail = async (values: ApiRequest<ShopDetailFormValues>): Promise<ApiResponse<number>> => {
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
      email: req.email,
      specified_commercial_transaction_act: req.specified_commercial_transaction_act,
      shop_image: '', // TODO: 画像保存をどうするのか。
      memo: req.memo,
      usage_status: req.usage_status,
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

/**
 * insert_companyDetail
 * 店舗情報を更新する。
 *
 * @param {ApiRequest<ShopDetailFormValues>} values - 入力情報
 * @returns {Promise<ApiResponse<number>>} 更新した店舗情報ID
 */
export const _updateShopDetail = async (values: ApiRequest<ShopDetailFormValues>): Promise<ApiResponse<number>> => {
  const req = values.request;

  const timestamp = getNow();
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
      email: req.email,
      specified_commercial_transaction_act: req.specified_commercial_transaction_act,
      shop_image: '', // TODO: 画像保存をどうするのか。
      memo: req.memo,
      usage_status: req.usage_status,
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
