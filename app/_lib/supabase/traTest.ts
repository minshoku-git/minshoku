import { Client } from 'pg';

import { CompanyDetailFormValues } from '@/app/_types/types';

import { getTimeString, getToday } from '../getDateTime';
import { getPostgreSqlItems } from '../utill';
import { t_companies, t_companies_department, t_companies_employment_status } from './tableTypes';
import { ApiRequest, ApiResponse } from './types';

/**
 * insert_companyDetail
 * Transaction専用・会社情報をINSERTする。
 * @param {ApiRequest<CompanyDetailFormValues>} values 入力内容
 * @returns {Promise<ApiResponse<number>>} 企業ID
 */
export const insert_companyDetail_TEST = async (
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
      memo: 'ソースだよ',
      usage_state: 0,
      optional_item_title_1: req.optional_item_title_1,
      optional_item_title_2: req.optional_item_title_2,
      optional_item_notes_1: req.optional_item_notes_1,
      optional_item_notes_2: req.optional_item_notes_2,
      url_key: '',
      offer_time_from: getTimeString(req.offer_time_from!),
      offer_time_to: getTimeString(req.offer_time_to!),
      order_period_day: Number(req.order_period_day),
      order_period_hour: Number(req.order_period_hour),
      order_period_minute: Number(req.order_period_minute),
      cancel_period_day: Number(req.cancel_period_day),
      cancel_period_hour: Number(req.cancel_period_hour),
      cancel_period_minute: Number(req.cancel_period_minute),
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
      let display_order: number = 1;
      for (const item of req.employmentStatusInfo) {
        // InsertData setting
        const insertValuesEmp: Omit<t_companies_employment_status, 'id' | 'created_at' | 'updated_at'> = {
          t_companies_id: newCompanyId,
          employment_status_name: item.employment_status_name,
          display_order: display_order,
          delete_flag: 0,
          deduction_flag: item.deduction_flag ? 1 : 0,
          credit_flag: item.credit_flag ? 1 : 0,
          paypay_flag: item.paypay_flag ? 1 : 0,
          set_meal_burden: item.set_meal_burden,
        };

        const {
          columns: columnsEmp,
          placeholders: placeholdersEmp,
          values: valuesEmp,
        } = getPostgreSqlItems(insertValuesEmp);
        const insertEmploymentStatusText = `INSERT INTO t_companies_employment_status (${columnsEmp.join(',')}) VALUES (${placeholdersEmp});`;

        // Insert
        await client.query(insertEmploymentStatusText, valuesEmp);
        display_order++;
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
 * update_companyDetail_TEST
 * Transaction専用・会社情報をUPDATEする。
 * @param {ApiRequest<CompanyDetailFormValues>} values - 入力内容
 * @returns {Promise<ApiResponse<number>>} 企業ID
 */
export const update_companyDetail_TEST = async (
  values: ApiRequest<CompanyDetailFormValues>
): Promise<ApiResponse<number>> => {
  const req = values.request;
  const timestamp = getToday();
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
      usage_state: 0,
      optional_item_title_1: req.optional_item_title_1,
      optional_item_title_2: req.optional_item_title_2,
      optional_item_notes_1: req.optional_item_notes_1,
      optional_item_notes_2: req.optional_item_notes_2,
      offer_time_from: getTimeString(req.offer_time_from!),
      offer_time_to: getTimeString(req.offer_time_to!),
      order_period_day: Number(req.order_period_day),
      order_period_hour: Number(req.order_period_hour),
      order_period_minute: Number(req.order_period_minute),
      cancel_period_day: Number(req.cancel_period_day),
      cancel_period_hour: Number(req.cancel_period_hour),
      cancel_period_minute: Number(req.cancel_period_minute),
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
      const deleteList = req.departmentInfo.filter((f) => f.id && f.delete_flag) ?? null;
      const updateList = req.departmentInfo.filter((f) => f.id && !f.delete_flag) ?? null;
      const insertList = req.departmentInfo.filter((f) => !f.id && !f.delete_flag) ?? null;

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
        // 最大ソート番号を取得
        const maxDisplayOrderText = `SELECT display_order FROM t_companies_department WHERE t_companies_id = $1 ORDER BY display_order DESC LIMIT 1;`;
        const maxDisplayOrderResult = await client.query(maxDisplayOrderText, [Number(req.id)]);
        let maxDisplayOrder = maxDisplayOrderResult.rows.length > 0 ? maxDisplayOrderResult.rows[0].display_order : 0; // データがなければ 0 にする例

        console.log('maxDisplayOrderResult' + maxDisplayOrder);

        for (const item of insertList) {
          const insertValuesDep: Omit<t_companies_department, 'id' | 'created_at' | 'updated_at'> = {
            t_companies_id: updatedId,
            department_name: item.name,
            delete_flag: 0,
            display_order: ++maxDisplayOrder,
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
      const deleteList = req.employmentStatusInfo.filter((f) => f.id && f.delete_flag) ?? null;
      const updateList = req.employmentStatusInfo.filter((f) => f.id && !f.delete_flag) ?? null;
      const insertList = req.employmentStatusInfo.filter((f) => !f.id && !f.delete_flag) ?? null;

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
          const updateCompanyText = `UPDATE t_companies_employment_status SET employment_status_name = $1, updated_at = $2 WHERE id = $3;`;
          const res = await client.query(updateCompanyText, [item.employment_status_name, timestamp, item.id]);
          if (res.rowCount === 0) {
            throw new Error('企業雇用形態情報の更新処理に失敗しました。');
          }
        }
      }
      if (insertList) {
        // 最大ソート番号を取得
        const maxDisplayOrderText = `SELECT display_order FROM t_companies_employment_status WHERE t_companies_id = $1 ORDER BY display_order DESC LIMIT 1;`;
        const maxDisplayOrderResult = await client.query(maxDisplayOrderText, [req.id]);
        let maxDisplayOrder = maxDisplayOrderResult.rows.length > 0 ? maxDisplayOrderResult.rows[0].display_order : 0;

        for (const item of insertList) {
          const insertValuesEmp: Omit<t_companies_employment_status, 'id' | 'created_at' | 'updated_at'> = {
            t_companies_id: updatedId,
            employment_status_name: item.employment_status_name,
            display_order: ++maxDisplayOrder,
            delete_flag: 0,
            deduction_flag: item.deduction_flag ? 1 : 0,
            credit_flag: item.credit_flag ? 1 : 0,
            paypay_flag: item.paypay_flag ? 1 : 0,
            set_meal_burden: item.set_meal_burden,
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
