import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { getNow } from '@/app/_lib/getDateTime';
import { deleteFile } from '@/app/_lib/subabaseStorage/deleteFile';
import { getImageSignedUrl } from '@/app/_lib/subabaseStorage/getImageUrl';
import { uploadFile } from '@/app/_lib/subabaseStorage/uploadFile';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_shops } from '@/app/_lib/supabase/tableTypes';
import { getPostgreSqlItems } from '@/app/_lib/utill';
import { BUCKET_SHOP_IMAGES, ERROR_MESSAGE } from '@/app/_types/constants';
import { UsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { shopDeteilRequestData, shopDeteilResponseData } from './types';

/* 店舗詳細
------------------------------------------------------------------ */

/**
 * _searchShopDetail
 * IDに一致する店舗情報を取得する。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<ApiResponse<shopDeteilResponseData>>} 検索結果
 */
export const _searchShopDetail = async (values: ApiRequest<number>): Promise<ApiResponse<shopDeteilResponseData>> => {
  const supabase = await createClient();
  const id = values.request;

  try {
    const query = supabase.from('t_shops').select('*').eq('id', id).single();
    const { data, error } = (await query) as PostgrestSingleResponse<t_shops>;

    if (error) {
      console.error(error);
      return { error: '店舗情報の取得' + ERROR_MESSAGE.TEMPLATE };
    }

    // 画像URLを取得
    let imageUrl: string = '';
    if (data.shop_image_file_name) {
      const filepath = BUCKET_SHOP_IMAGES + '/' + id + '/' + data.shop_image_file_name;
      imageUrl = await getImageSignedUrl(supabase, BUCKET_SHOP_IMAGES, filepath);
      if (!imageUrl) {
        console.error(error);
        return { error: '店舗画像ファイルの取得' + ERROR_MESSAGE.TEMPLATE };
      }
    }

    const res: shopDeteilResponseData = {
      id: data.id?.toString(),
      shop_name: data.shop_name ?? '',
      shop_name_kana: data.shop_name_kana ?? '',
      shop_postal_code: data.shop_postal_code ?? '',
      shop_prefectures: data.shop_prefectures ?? '',
      shop_municipalities: data.shop_municipalities ?? '',
      shop_town_area: data.shop_town_area ?? '',
      shop_area_block_number: data.shop_area_block_number ?? '',
      shop_building_name: data.shop_building_name ?? '',
      tel_no: data.tel_no ?? '',
      email: data.email ?? '',
      specified_commercial_transaction_act: data.specified_commercial_transaction_act,
      memo: data.memo,
      usage_status: data.usage_status ?? UsageStatus.AVAILABLE,
      shop_image_file_name: data.shop_image_file_name ?? '',
      shop_image_url: imageUrl,
    };

    return {
      data: res,
    };
  } catch (e) {
    console.error(e);
    return { error: ERROR_MESSAGE.UNEXPECTED };
  }
};

/**
 * _insertShopDetail
 * 店舗情報を新規登録する。
 *
 * @param {shopDeteilRequestData} values - 入力情報
 * @returns {Promise<ApiResponse<number>>} 新規登録した店舗情報ID
 */
export const _insertShopDetail = async (values: shopDeteilRequestData): Promise<ApiResponse<number>> => {
  const req = values;
  const supabase = await createClient();
  const pgClient = createPgClient();

  let res: ApiResponse<number> = {};

  try {
    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await pgClient.query('BEGIN');

    /* Insert - t_shops
  　------------------------------------------------------------------ */
    // InsertData setting
    const insertValues: Omit<t_shops, 'id' | 'created_at' | 'updated_at'> = {
      shop_name: req.shop_name,
      shop_name_kana: req.shop_name_kana,
      shop_postal_code: req.shop_postal_code,
      shop_prefectures: req.shop_prefectures,
      shop_municipalities: req.shop_municipalities,
      shop_town_area: req.shop_town_area,
      shop_area_block_number: req.shop_area_block_number,
      shop_building_name: req.shop_building_name,
      tel_no: req.tel_no,
      email: req.email,
      specified_commercial_transaction_act: req.specified_commercial_transaction_act,
      shop_image_file_name: req.shop_image_file_name,
      shop_image_file_bytesize: req.shop_image_file_bytesize,
      memo: req.memo,
      usage_status: req.usage_status,
      gmo_shop_code: '', // TODO: 店舗新規登録時、何を設定したらいいのか要確認。
      gmo_shop_password: '', // TODO: 店舗新規登録時、何を設定したらいいのか要確認。
    };
    const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
    const insertShopText = `INSERT INTO t_shops (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

    // Insert
    const result = await pgClient.query(insertShopText, values);
    if (result.rowCount === 0) {
      return { error: '店舗情報の新規登録' + ERROR_MESSAGE.TEMPLATE };
    }

    const newShopId: number = result.rows[0]?.id;

    /* upload - 店舗イメージ画像
  　------------------------------------------------------------------ */
    if (req.shop_image_file_name && req.shop_image_file_data) {
      const filepath = BUCKET_SHOP_IMAGES + '/' + newShopId + '/' + req.shop_image_file_name;
      await uploadFile(supabase, BUCKET_SHOP_IMAGES, filepath, req.shop_image_file_data);
    }

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, new company ID:', newShopId);

    res = { data: newShopId };
  } catch (error) {
    // Rollback
    await pgClient.query('ROLLBACK');
    console.error('Transaction failed:', error);

    res = { error: ERROR_MESSAGE.UNEXPECTED };
  } finally {
    // Transaction End
    await pgClient.end();
    return res;
  }
};

/**
 * _updateShopDetail
 * 店舗情報を更新する。
 *
 * @param {shopDeteilRequestData} values - 入力情報
 * @returns {Promise<ApiResponse<number>>} 更新した店舗情報ID
 */
export const _updateShopDetail = async (values: shopDeteilRequestData): Promise<ApiResponse<number>> => {
  const req = values;
  const supabase = await createClient();
  const pgClient = createPgClient();
  const timestamp = getNow();

  let res: ApiResponse<number> = {};

  try {
    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await pgClient.query('BEGIN');

    /* Select - t_shops 店舗画像ファイル名取得
  　------------------------------------------------------------------ */
    const query = supabase.from('t_shops').select('shop_image_file_name').eq('id', req.id).single();
    const { data, error } = (await query) as PostgrestSingleResponse<t_shops>;
    const ex_shop_image_file_name = data?.shop_image_file_name ?? '';

    if (error) {
      console.error(error);
      return { error: '店舗画像ファイルの取得' + ERROR_MESSAGE.TEMPLATE };
    }

    /* Update - t_shops
  　------------------------------------------------------------------ */
    // UpdateData setting
    const updateValues: Partial<Omit<t_shops, 'id' | 'url_key' | 'created_at'>> = {
      shop_name: req.shop_name,
      shop_name_kana: req.shop_name_kana,
      shop_postal_code: req.shop_postal_code,
      shop_prefectures: req.shop_prefectures,
      shop_municipalities: req.shop_municipalities,
      shop_town_area: req.shop_town_area,
      shop_area_block_number: req.shop_area_block_number,
      shop_building_name: req.shop_building_name,
      tel_no: req.tel_no,
      email: req.email,
      specified_commercial_transaction_act: req.specified_commercial_transaction_act,
      memo: req.memo,
      usage_status: req.usage_status,
      gmo_shop_code: '', // TODO: 店舗新規登録時の値を確認
      gmo_shop_password: '', // TODO: 店舗新規登録時の値を確認
      updated_at: timestamp,
    };

    // 新規登録の画像ファイルが存在する場合
    if (req.shop_image_file_data || (!req.shop_image_file_name && ex_shop_image_file_name)) {
      updateValues.shop_image_file_name = req.shop_image_file_name;
      updateValues.shop_image_file_bytesize = req.shop_image_file_bytesize;
    }

    const { columns, values } = getPostgreSqlItems(updateValues);
    const updateCompanyText = `UPDATE t_shops SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')} WHERE id = ${req.id} RETURNING id;`;

    // Update
    const result = await pgClient.query(updateCompanyText, values);

    if (result.rowCount === 0) {
      console.error(error);
      return { error: '店舗情報の更新' + ERROR_MESSAGE.TEMPLATE };
    }

    const updatedId = result.rows[0]?.id;

    /* Upload / Delete - shop-images
  　------------------------------------------------------------------ */
    // 店舗画像ファイル削除
    // 新規登録の画像ファイルが存在する && 既存ファイル名が値有りの場合
    if (
      (req.shop_image_file_data && ex_shop_image_file_name) ||
      (!req.shop_image_file_name && ex_shop_image_file_name)
    ) {
      const filepath = BUCKET_SHOP_IMAGES + '/' + updatedId + '/' + ex_shop_image_file_name;
      await deleteFile(supabase, BUCKET_SHOP_IMAGES, filepath);
    }

    // 店舗画像ファイル登録
    // 新規登録の画像ファイルが存在する場合
    if (req.shop_image_file_data) {
      const filepath = BUCKET_SHOP_IMAGES + '/' + updatedId + '/' + req.shop_image_file_name;
      await uploadFile(supabase, BUCKET_SHOP_IMAGES, filepath, req.shop_image_file_data);
    }

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');
    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, update company ID:', updatedId);

    // Response setting
    res = {
      data: updatedId,
    };
  } catch (error) {
    // Rollback
    await pgClient.query('ROLLBACK');

    console.error('Transaction failed:', error);
    res = { error: ERROR_MESSAGE.UNEXPECTED };
  } finally {
    // Transaction End
    await pgClient.end();
  }
  return res;
};
