import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { BUCKET_SHOP_IMAGES } from '@/app/_config/constants';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_shops } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { deleteFile } from '@/app/_lib/supabaseStorage/deleteFile';
import { getImageSignedUrl } from '@/app/_lib/supabaseStorage/getImageUrl';
import { uploadFile } from '@/app/_lib/supabaseStorage/uploadFile';
import { getNow } from '@/app/_lib/utils/getDateTime';
import { getPostgreSqlItems, getSafeFileName } from '@/app/_lib/utils/utils';
import { UsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { ShopDetailInitValues, shopDeteilRequestData, shopDeteilResponseData } from './types';

/* 店舗詳細
------------------------------------------------------------------ */

/**
 * searchShopDetail
 * IDに一致する店舗情報を取得する。
 *
 * @param {ApiRequest<ShopDetailInitValues>} values - 検索条件
 * @returns {Promise<ApiResponse<shopDeteilResponseData>>} 検索結果
 */
export const searchShopDetail = async (
  values: ApiRequest<ShopDetailInitValues>
): Promise<ApiResponse<shopDeteilResponseData>> => {
  const supabase = await createClient();
  const id = values.request.id;

  try {
    const query = supabase.from('t_shops').select('*').eq('id', id).single();
    const { data, error } = (await query) as PostgrestSingleResponse<t_shops>;

    if (error || !data) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '店舗情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    // 画像URLを取得
    let imageUrl: string = '';
    if (data.shop_image_safe_file_name) {
      const filepath = BUCKET_SHOP_IMAGES + '/' + id + '/' + data.shop_image_safe_file_name;
      try {
        imageUrl = await getImageSignedUrl(supabase, process.env.SUPABASE_STORAGE!, filepath);
      } catch (imgErr) {
        // 画像ファイルのロード失敗のみで店舗全体が表示不能になるのを防ぐマイルドな例外ガード
        console.warn('店舗画像URLの取得に失敗しました。:', imgErr);
        imageUrl = '';
      }
    }

    const res: shopDeteilResponseData = {
      id: data.id?.toString(),
      shop_name: data.shop_name ?? '',
      shop_name_kana: data.shop_name_kana ?? '',
      shop_postal_code_prefix: data.shop_postal_code ? data.shop_postal_code.slice(0, 3) : '',
      shop_postal_code_suffix: data.shop_postal_code ? data.shop_postal_code.slice(3, 7) : '',
      shop_address: data.shop_address ?? '',
      shop_area_block_number: data.shop_area_block_number ?? '',
      shop_building_name: data.shop_building_name ?? '',
      tel_no: data.tel_no ?? '',
      email: data.email ?? '',
      gmo_shop_code: data.gmo_shop_code ?? '',
      gmo_shop_password: data.gmo_shop_password ?? '',
      specified_commercial_transaction_act: data.specified_commercial_transaction_act ?? '',
      memo: data.memo ?? '',
      usage_status: (data.usage_status as UsageStatus) ?? UsageStatus.AVAILABLE,
      shop_image_file_name: data.shop_image_file_name ?? '',
      shop_image_url: imageUrl ?? '',
      tabelog_url: data.tabelog_url ?? '',
      shop_description: data.shop_description ?? '',
    };

    return {
      success: true,
      data: res,
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

/**
 * _insertShopDetail
 * 店舗情報を新規登録する。
 *
 * @param {shopDeteilRequestData} values - 入力情報
 * @returns {Promise<ApiResponse<number>>} 新規登録した店舗情報ID
 */
export const insertShopDetail = async (values: shopDeteilRequestData): Promise<ApiResponse<number>> => {
  const req = values;
  const supabase = await createClient();

  // connection Start
  const pgClient = await createPgClient();

  try {
    // Transaction Start
    await pgClient.query('BEGIN');

    const safeFileName = getSafeFileName(req.shop_image_file_name ?? '');

    /* Insert - t_shops
  　------------------------------------------------------------------ */
    // InsertData setting
    const insertValues: Omit<t_shops, 'id' | 'created_at' | 'updated_at'> = {
      shop_name: req.shop_name,
      shop_name_kana: req.shop_name_kana,
      shop_postal_code: req.shop_postal_code_prefix + req.shop_postal_code_suffix,
      shop_address: req.shop_address,
      shop_area_block_number: req.shop_area_block_number,
      shop_building_name: req.shop_building_name,
      tel_no: req.tel_no,
      email: req.email,
      specified_commercial_transaction_act: req.specified_commercial_transaction_act,
      shop_image_file_name: req.shop_image_file_name,
      shop_image_file_bytesize: req.shop_image_file_bytesize,
      shop_image_safe_file_name: safeFileName,
      tabelog_url: req.tabelog_url,
      shop_description: req.shop_description,
      memo: req.memo,
      usage_status: UsageStatus.AVAILABLE,
      gmo_shop_code: req.gmo_shop_code, 
      gmo_shop_password: req.gmo_shop_password, 
    };
    const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
    const insertShopText = `INSERT INTO t_shops (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

    // Insert
    const result = await pgClient.query(insertShopText, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '店舗情報の新規登録' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    const newShopId: number = result.rows[0]?.id;

    /* upload - 店舗イメージ画像
  　------------------------------------------------------------------ */
    if (req.shop_image_file_name && req.shop_image_file_data) {
      const filepath = BUCKET_SHOP_IMAGES + '/' + newShopId + '/' + safeFileName;
      await uploadFile(supabase, process.env.SUPABASE_STORAGE!, filepath, req.shop_image_file_data);
    }

    /* --------------------------------------------------------------- */
    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, new company ID:', newShopId);

    return { success: true, data: newShopId };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    await rollbackWithLog(pgClient);

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
  } finally {
    // Transaction End
    await pgClient.end();
  }
};

/**
 * _updateShopDetail
 * 店舗情報を更新する。
 *
 * @param {shopDeteilRequestData} values - 入力情報
 * @returns {Promise<ApiResponse<number>>} 更新した店舗情報ID
 */
export const updateShopDetail = async (values: shopDeteilRequestData): Promise<ApiResponse<number>> => {
  const req = values;
  const timestamp = getNow();
  const supabase = await createClient();

  // connection Start
  const pgClient = await createPgClient();

  try {
    // Transaction Start
    await pgClient.query('BEGIN');

    /* Select - t_shops 店舗画像ファイル名取得
  　------------------------------------------------------------------ */
    const query = supabase.from('t_shops').select('shop_image_safe_file_name').eq('id', req.id).maybeSingle();
    const { data, error } = (await query) as PostgrestSingleResponse<t_shops>;
    const exSafeFileName = data?.shop_image_safe_file_name ?? '';

    if (error) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '店舗画像ファイルの取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* Update - t_shops
  　------------------------------------------------------------------ */
    // UpdateData setting
    const updateValues: Partial<Omit<t_shops, 'id' | 'url_key' | 'created_at'>> = {
      shop_name: req.shop_name,
      shop_name_kana: req.shop_name_kana,
      shop_postal_code: req.shop_postal_code_prefix + req.shop_postal_code_suffix,
      shop_address: req.shop_address,
      shop_area_block_number: req.shop_area_block_number,
      shop_building_name: req.shop_building_name,
      tel_no: req.tel_no,
      email: req.email,
      specified_commercial_transaction_act: req.specified_commercial_transaction_act,
      tabelog_url: req.tabelog_url,
      shop_description: req.shop_description,
      memo: req.memo,
      usage_status: UsageStatus.AVAILABLE,
      gmo_shop_code: req.gmo_shop_code ?? '',
      gmo_shop_password: req.gmo_shop_password ?? '',
      updated_at: timestamp,
    };

    // 新規登録の画像ファイルが存在する場合
    const safeFileName = getSafeFileName(req.shop_image_file_name ?? '');
    if (req.shop_image_file_data) {
      // 新しい画像ファイルがアップロードされた場合
      updateValues.shop_image_file_name = req.shop_image_file_name;
      updateValues.shop_image_file_bytesize = req.shop_image_file_bytesize ?? 0;
      updateValues.shop_image_safe_file_name = safeFileName;
    } else if (req.shop_image_file_name === '' && exSafeFileName) {
      // ユーザーが画像を削除した場合（ファイルがなく、名前が空文字で送られてきた場合）
      updateValues.shop_image_file_name = '';
      updateValues.shop_image_file_bytesize = 0;
      updateValues.shop_image_safe_file_name = '';
    }

    const { columns, values } = getPostgreSqlItems(updateValues);
    const updateCompanyText = `UPDATE t_shops SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')} WHERE id = ${req.id} RETURNING id;`;

    // Update
    const result = await pgClient.query(updateCompanyText, values);

    if (result.rowCount === 0) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '店舗情報の更新' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    const updatedId = result.rows[0]?.id;

    /* Upload / Delete - shop-images (【修正箇所】不要な誤爆削除を防ぐよう厳格化)
  　------------------------------------------------------------------ */
    
    // 既存画像があり、かつ「画像を上書きアップロードする場合」または「ゴミ箱ボタンで明示的に画像を消去した場合」のみ、ストレージから古いファイルを削除
    const isImageOverwritten = !!req.shop_image_file_data && !!exSafeFileName;
    const isImageDeleted = !req.shop_image_file_data && req.shop_image_file_name === '' && !!exSafeFileName;

    if (isImageOverwritten || isImageDeleted) {
      const filepath = BUCKET_SHOP_IMAGES + '/' + updatedId + '/' + exSafeFileName;
      await deleteFile(supabase, process.env.SUPABASE_STORAGE!, filepath);
    }

    // 新しくアップロードされた画像ファイルをストレージに登録
    if (req.shop_image_file_data) {
      const filepath = BUCKET_SHOP_IMAGES + '/' + updatedId + '/' + safeFileName;
      await uploadFile(supabase, process.env.SUPABASE_STORAGE!, filepath, req.shop_image_file_data);
    }

    /* --------------------------------------------------------------- */
    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, update company ID:', updatedId);

    // Response setting
    return { success: true, data: updatedId };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    await rollbackWithLog(pgClient);

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
  } finally {
    // Transaction End
    await pgClient.end();
  }
};