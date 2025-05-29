import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { Client } from 'pg';

import { DepartmentData, EmploymentData } from '@/app/_lib/createMockData';
import { getNow, getTimeString, getTodayZeroHour } from '@/app/_lib/getDateTime';
import { supabase } from '@/app/_lib/supabase/supabase';
import { t_companies, t_companies_department, t_companies_employment_status } from '@/app/_lib/supabase/tableTypes';
import { checkTempId, convertTimeToDate, getPostgreSqlItems } from '@/app/_lib/utill';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CompanyDetailFormValues } from '@/app/(private)/companyDetail/[id]/_lib/types';

/**
 * get_companyDetail
 * IDに一致する会社情報を取得する。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<ApiResponse<CompanyDetailFormValues>>} 検索結果
 */
export const _searchComponyDetail = async (
  values: ApiRequest<number>
): Promise<ApiResponse<CompanyDetailFormValues>> => {
  // 1.会社get_companyDetail情報取得
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
  const defalutDate = getTodayZeroHour();

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
    offer_time_from: data.offer_time_from ? convertTimeToDate(data.offer_time_from) : defalutDate,
    offer_time_to: data.offer_time_to ? convertTimeToDate(data.offer_time_to) : defalutDate,
    order_period_day: data.order_period_day?.toString() ?? '',
    order_period_time: data.order_period_time ? convertTimeToDate(data.order_period_time) : defalutDate,
    cancel_period_day: data.cancel_period_day?.toString() ?? '',
    cancel_period_time: data.cancel_period_time ? convertTimeToDate(data.cancel_period_time) : defalutDate,
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
 * Transaction専用・会社情報をINSERTする。
 * @param {ApiRequest<CompanyDetailFormValues>} values 入力内容
 * @returns {Promise<ApiResponse<number>>} 企業ID
 */
export const _insertComponyDetail = async (
  values: ApiRequest<CompanyDetailFormValues>
): Promise<ApiResponse<number>> => {
  const req = values.request;
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  });

  let res: ApiResponse<number> = { data: null, error: null };

  try {
    // connection Start
    await client.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await client.query('BEGIN');

    /* Insert - t_companies
  　------------------------------------------------------------------ */
    // InsertData setting
    const insertValues: Omit<t_companies, 'id' | 'created_at' | 'updated_at'> = {
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
      optional_item_title_1: req.optional_item_title_1,
      optional_item_title_2: req.optional_item_title_2,
      optional_item_notes_1: req.optional_item_notes_1,
      optional_item_notes_2: req.optional_item_notes_2,
      url_key: '', // TODO:仕様確定待ち
      offer_time_from: getTimeString(req.offer_time_from!),
      offer_time_to: getTimeString(req.offer_time_to!),
      order_period_day: Number(req.order_period_day),
      order_period_time: getTimeString(req.order_period_time!),
      cancel_period_day: Number(req.cancel_period_day),
      cancel_period_time: getTimeString(req.cancel_period_time!),
      usage_status: req.usage_status,
    };
    const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
    const insertCompanyText = `INSERT INTO t_companies (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

    // Insert
    const result = await client.query(insertCompanyText, values);
    const newCompanyId = result.rows[0]?.id;

    /* Insert - t_companies_department
  　------------------------------------------------------------------ */
    if (req.departmentInfo.length > 0) {
      for (const item of req.departmentInfo) {
        // InsertData setting
        const insertValuesDep: Omit<t_companies_department, 'id' | 'created_at' | 'updated_at'> = {
          t_companies_id: newCompanyId,
          department_name: item.name,
          delete_flag: 0,
        };
        const {
          columns: columnsDep,
          placeholders: placeholdersDep,
          values: valuesDep,
        } = getPostgreSqlItems(insertValuesDep);
        const insertDepartmentText = `INSERT INTO t_companies_department (${columnsDep.join(',')}) VALUES (${placeholdersDep});`;

        // Insert
        await client.query(insertDepartmentText, valuesDep);
      }
    }

    /* Insert - t_companies_employment_status
  　------------------------------------------------------------------ */
    if (req.employmentStatusInfo.length > 0) {
      for (const item of req.employmentStatusInfo) {
        // InsertData setting
        const insertValuesEmp: Omit<t_companies_employment_status, 'id' | 'created_at' | 'updated_at'> = {
          t_companies_id: newCompanyId,
          employment_status_name: item.employment_status_name,
          delete_flag: 0,
          deduction_flag: item.deduction_flag ? 1 : 0,
          credit_flag: item.credit_flag ? 1 : 0,
          paypay_flag: item.paypay_flag ? 1 : 0,
          set_meal_burden: Number(item.set_meal_burden),
        };

        const {
          columns: columnsEmp,
          placeholders: placeholdersEmp,
          values: valuesEmp,
        } = getPostgreSqlItems(insertValuesEmp);
        const insertEmploymentStatusText = `INSERT INTO t_companies_employment_status (${columnsEmp.join(',')}) VALUES (${placeholdersEmp});`;

        // Insert
        await client.query(insertEmploymentStatusText, valuesEmp);
      }
    }
    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await client.query('COMMIT');
    console.log('Transaction completed, new company ID:', newCompanyId);

    // Response setting
    res = {
      data: newCompanyId,
      error: null,
    };
  } catch (error) {
    // Rollback
    console.error('Transaction failed:', error);
    await client.query('ROLLBACK');
    res = {
      data: null,
      error: (error as Error).message,
    };
  } finally {
    // Transaction End
    await client.end();
  }
  return res;
};

/**
 * update_companyDetail
 * Transaction専用・会社情報をUPDATEする。
 * @param {ApiRequest<CompanyDetailFormValues>} values - 入力内容
 * @returns {Promise<ApiResponse<number>>} 企業ID
 */
export const _updateComponyDetail = async (
  values: ApiRequest<CompanyDetailFormValues>
): Promise<ApiResponse<number>> => {
  const req = values.request;
  const timestamp = getNow();
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  });

  let res: ApiResponse<number> = { data: null, error: null };

  try {
    // connection Start
    await client.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await client.query('BEGIN');

    /* Update - t_companies_employment_status
  　------------------------------------------------------------------ */
    // InsertData setting
    const updateValues: Omit<t_companies, 'id' | 'url_key' | 'created_at'> = {
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
      optional_item_title_1: req.optional_item_title_1,
      optional_item_title_2: req.optional_item_title_2,
      optional_item_notes_1: req.optional_item_notes_1,
      optional_item_notes_2: req.optional_item_notes_2,
      offer_time_from: getTimeString(req.offer_time_from!),
      offer_time_to: getTimeString(req.offer_time_to!),
      order_period_day: Number(req.order_period_day),
      order_period_time: getTimeString(req.order_period_time!),
      cancel_period_day: Number(req.cancel_period_day),
      cancel_period_time: getTimeString(req.cancel_period_time!),
      usage_status: req.usage_status,
      updated_at: timestamp,
    };
    const { columns, values } = getPostgreSqlItems(updateValues);
    const updateCompanyText = `UPDATE t_companies SET ${columns.map((col, index) => `${col} = $${index + 1}`).join(', ')} WHERE id = ${req.id} RETURNING id;`;

    // Insert
    const result = await client.query(updateCompanyText, values);

    if (result.rowCount === 0) {
      throw new Error('企業情報の更新処理に失敗しました。');
    }

    const updatedId = result.rows[0]?.id;

    /* Dalete/Update/Insert - t_companies_department
  　------------------------------------------------------------------ */

    if (req.departmentInfo.length > 0) {
      const deleteList = req.departmentInfo.filter((f) => !checkTempId(f.id) && f.delete_flag) ?? null;
      const updateList = req.departmentInfo.filter((f) => !checkTempId(f.id) && !f.delete_flag) ?? null;
      const insertList = req.departmentInfo.filter((f) => checkTempId(f.id) && !f.delete_flag) ?? null;

      console.log('deleteList', deleteList);
      console.log('updateList', updateList);
      console.log('insertList', insertList);

      if (deleteList) {
        for (const item of deleteList) {
          const deleteCompanyText = `UPDATE t_companies_department SET delete_flag = 1, updated_at = $1 WHERE id = $2;`;
          const res = await client.query(deleteCompanyText, [timestamp, item.id]);
          if (res.rowCount === 0) {
            throw new Error('企業部署情報の削除処理に失敗しました。');
          }
        }
      }

      if (updateList) {
        for (const item of updateList) {
          const updateCompanyText = `UPDATE t_companies_department SET department_name = $1, updated_at = $2 WHERE id = $3;`;
          const res = await client.query(updateCompanyText, [item.name, timestamp, item.id]);
          if (res.rowCount === 0) {
            throw new Error('企業部署情報の更新処理に失敗しました。');
          }
        }
      }

      if (insertList) {
        for (const item of insertList) {
          const insertValuesDep: Omit<t_companies_department, 'id' | 'created_at' | 'updated_at'> = {
            t_companies_id: updatedId,
            department_name: item.name,
            delete_flag: 0,
          };
          const {
            columns: columnsDep,
            placeholders: placeholdersDep,
            values: valuesDep,
          } = getPostgreSqlItems(insertValuesDep);
          const insertDepartmentText = `INSERT INTO t_companies_department (${columnsDep.join(',')}) VALUES (${placeholdersDep});`;

          // Insert
          const res = await client.query(insertDepartmentText, valuesDep);
          if (res.rowCount === 0) {
            throw new Error('企業部署情報の登録処理に失敗しました。');
          }
        }
      }
    }

    /* Dalete/Update/Insert - t_companies_employment_status
  　------------------------------------------------------------------ */
    if (req.employmentStatusInfo.length > 0) {
      const deleteList = req.employmentStatusInfo.filter((f) => !checkTempId(f.id) && f.delete_flag) ?? null;
      const updateList = req.employmentStatusInfo.filter((f) => !checkTempId(f.id) && !f.delete_flag) ?? null;
      const insertList = req.employmentStatusInfo.filter((f) => checkTempId(f.id) && !f.delete_flag) ?? null;

      if (deleteList) {
        for (const item of deleteList) {
          const deleteCompanyText = `UPDATE t_companies_employment_status SET delete_flag = 1, updated_at = $1 WHERE id = $2;`;
          const res = await client.query(deleteCompanyText, [timestamp, item.id]);
          if (res.rowCount === 0) {
            throw new Error('企業雇用形態情報の削除処理に失敗しました。');
          }
        }
      }
      if (updateList) {
        for (const item of updateList) {
          const updateCompanyText = `
            UPDATE 
              t_companies_employment_status
            SET 
              employment_status_name = $1,
              deduction_flag = $2,
              credit_flag = $3,
              paypay_flag = $4,
              set_meal_burden = $5,
              updated_at = $6
            WHERE 
              id = $7;`;
          const res = await client.query(updateCompanyText, [
            item.employment_status_name,
            item.deduction_flag ? 1 : 0,
            item.credit_flag ? 1 : 0,
            item.paypay_flag ? 1 : 0,
            item.set_meal_burden,
            timestamp,
            item.id,
          ]);
          if (res.rowCount === 0) {
            throw new Error('企業雇用形態情報の更新処理に失敗しました。');
          }
        }
      }
      if (insertList) {
        for (const item of insertList) {
          const insertValuesEmp: Omit<t_companies_employment_status, 'id' | 'created_at' | 'updated_at'> = {
            t_companies_id: updatedId,
            employment_status_name: item.employment_status_name,
            delete_flag: 0,
            deduction_flag: item.deduction_flag ? 1 : 0,
            credit_flag: item.credit_flag ? 1 : 0,
            paypay_flag: item.paypay_flag ? 1 : 0,
            set_meal_burden: Number(item.set_meal_burden),
          };
          const {
            columns: columnsEmp,
            placeholders: placeholdersEmp,
            values: valuesEmp,
          } = getPostgreSqlItems(insertValuesEmp);
          const insertEmploymentStatusText = `INSERT INTO t_companies_employment_status (${columnsEmp.join(',')}) VALUES (${placeholdersEmp});`;

          // Insert
          const res = await client.query(insertEmploymentStatusText, valuesEmp);
          if (res.rowCount === 0) {
            throw new Error('企業雇用形態情報の登録処理に失敗しました。');
          }
        }
      }
    }
    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');
    // Commit
    await client.query('COMMIT');
    console.log('Transaction completed, update company ID:', updatedId);

    // Response setting
    res = {
      data: updatedId,
      error: null,
    };
  } catch (error) {
    // Rollback
    console.error('Transaction failed:', error);
    await client.query('ROLLBACK');
    res = {
      data: null,
      error: (error as Error).message,
    };
  } finally {
    // Transaction End
    await client.end();
  }
  return res;
};
