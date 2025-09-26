import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { encrypt } from '@/app/_lib/encryption/crypto';
import { getNow, getTimeString, getTodayXHour } from '@/app/_lib/getDateTime';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_companies, t_companies_department, t_companies_employment_status } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { checkTempId, convertTimeToDate, getPostgreSqlItems } from '@/app/_lib/utill';
import { ERROR_MESSAGE } from '@/app/_types/constants';
import { DeletionStatus, SelectType, UsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, DepartmentData, EmploymentData } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { CompanyDetailFormValues, CompanyDetailResult, CompanyDetailToken } from './types';

export type usageData = {
  id: number;
  usage: boolean;
  error: boolean;
};

/**
 * _searchComponyDetail
 * IDに一致する会社情報を取得する。
 *
 * @param {ApiRequest<number>} values - 検索条件
 * @returns {Promise<ApiResponse<CompanyDetailResult>>} 検索結果
 */
export const _searchCompanyDetail = async (values: ApiRequest<number>): Promise<ApiResponse<CompanyDetailResult>> => {
  const supabase = await createClient();
  const id = values.request;

  try {
    /* 0.暗号化
    ------------------------------------------------------------------ */
    const tokenTarget: CompanyDetailToken = { t_companies_id: id };
    const token: string = encrypt(JSON.stringify(tokenTarget));
    const url = process.env.APP_URL_DEV + '/login/' + token;

    /* 1.会社情報取得
    ------------------------------------------------------------------ */
    const query = supabase.from('t_companies').select('*').eq('id', id).single();
    const { data, error } = (await query) as PostgrestSingleResponse<t_companies>;

    if (error || !data) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '会社情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    // 2-1.部署情報取得
    const queryDep = supabase
      .from('t_companies_department')
      .select('*')
      .eq('t_companies_id', id)
      .eq('delete_flag', DeletionStatus.ACTIVE)
      .order('id', { ascending: true });
    const { data: dataDep, error: errorDep } = (await queryDep) as PostgrestSingleResponse<t_companies_department[]>;

    if (errorDep) {
      console.error(errorDep);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '部署情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    // 3-2.雇用種別情報 使用状況取得
    const departmentId = dataDep.map((m) => m.id!);
    const usageDepartment: usageData[] = await Promise.all(
      departmentId.map(async (id) => {
        const { data, error } = await supabase
          .from('t_user')
          .select('id')
          .eq('t_companies_id', id)
          .eq('t_companies_department_id', id)
          .limit(1);

        if (error) {
          console.error(`Error checking department ${id}:`, error);
          return {
            id: id,
            usage: false,
            error: true,
          };
        }
        return {
          id: id,
          usage: data.length > 0,
          error: false,
        };
      })
    );

    if (usageDepartment.find((f) => f.error)) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '部署情報(利用状況)の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    // 3-1.雇用種別情報取得
    const queryEmp = supabase
      .from('t_companies_employment_status')
      .select('*')
      .eq('t_companies_id', id)
      .eq('delete_flag', DeletionStatus.ACTIVE)
      .order('id', { ascending: true });
    const { data: dataEmp, error: errorEmp } = (await queryEmp) as PostgrestSingleResponse<
      t_companies_employment_status[]
    >;

    if (errorEmp) {
      console.error(errorEmp);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '雇用種別情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    // 3-2.雇用種別情報 使用状況取得
    const employmentId = dataEmp.map((m) => m.id!);
    const usageEmployment: usageData[] = await Promise.all(
      employmentId.map(async (id) => {
        const { data, error } = await supabase
          .from('t_user')
          .select('id')
          .eq('t_companies_id', id)
          .eq('t_companies_employment_status_id', id)
          .limit(1);

        if (error) {
          console.error(`Error checking employment ${id}:`, error);
          return {
            id: id,
            usage: false,
            error: true,
          };
        }
        return {
          id: id,
          usage: data.length > 0,
          error: false,
        };
      })
    );

    if (usageEmployment.find((f) => f.error)) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '雇用種別情報(利用状況)の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    // Response set
    const depInit: DepartmentData[] = dataDep
      ? dataDep.map((m) => {
          return {
            id: m.id!.toString(),
            name: m.department_name ?? '',
            disabled: usageDepartment.find((d) => d.id === m.id && d.usage) ? true : false,
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
            disabled: usageEmployment.find((d) => d.id === m.id && d.usage) ? true : false,
            deduction_flag: m.deduction_flag === SelectType.UNSELECTED ? false : true,
            credit_flag: m.credit_flag === SelectType.UNSELECTED ? false : true,
            paypay_flag: m.paypay_flag === SelectType.UNSELECTED ? false : true,
            set_meal_burden: m.set_meal_burden ? m.set_meal_burden.toString() : '0',
            delete_flag: false,
          };
        })
      : [];

    const domainInit: DepartmentData[] = data.domain
      ? data.domain.map((m, index) => {
          return {
            id: index.toString(),
            name: m ?? '',
            disabled: false,
            delete_flag: false,
          };
        })
      : [];

    const defalutDate = getTodayXHour();

    const res: CompanyDetailResult = {
      url: url,
      id: data.id?.toString(),
      company_name: data.company_name ?? '',
      branch_name: data.branch_name ?? '',
      postal_code_prefix: data.postal_code ? data.postal_code.slice(0, 3) : '',
      postal_code_suffix: data.postal_code ? data.postal_code.slice(3, 7) : '',
      address: data.address ?? '',
      area_block_number: data.area_block_number ?? '',
      building_name: data.building_name ?? '',
      restaurant_name: data.restaurant_name ?? '',
      email: data.email ?? '',
      memo: data.memo ?? '',
      location: data.location ?? '',
      offer_time_from: data.offer_time_from ? convertTimeToDate(data.offer_time_from) : defalutDate,
      offer_time_to: data.offer_time_to ? convertTimeToDate(data.offer_time_to) : defalutDate,
      order_period_day: data.order_period_day?.toString() ?? '',
      order_period_time: data.order_period_time ? convertTimeToDate(data.order_period_time) : defalutDate,
      cancel_period_day: data.cancel_period_day?.toString() ?? '',
      cancel_period_time: data.cancel_period_time ? convertTimeToDate(data.cancel_period_time) : defalutDate,
      optional_item_title_1: data.optional_item_title_1 ?? '',
      optional_item_title_2: data.optional_item_title_2 ?? '',
      optional_item_notes_1: data.optional_item_notes_1 ?? '',
      optional_item_notes_2: data.optional_item_notes_2 ?? '',
      departmentInfo: depInit,
      employmentStatusInfo: empInit,
      domain: domainInit ?? [],
      usage_status: data.usage_status === UsageStatus.AVAILABLE ? UsageStatus.AVAILABLE : UsageStatus.DEACTIVATION,
    };

    return { success: true, data: res };
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
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
  const client = createPgClient();
  const req = values.request;

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
      postal_code: req.postal_code_prefix + req.postal_code_suffix,
      address: req.address,
      area_block_number: req.area_block_number,
      building_name: req.building_name,
      restaurant_name: req.restaurant_name,
      location: req.location,
      email: req.email,
      memo: req.memo,
      domain: req.domain.map((m) => m.name),
      optional_item_title_1: req.optional_item_title_1,
      optional_item_title_2: req.optional_item_title_2,
      optional_item_notes_1: req.optional_item_notes_1,
      optional_item_notes_2: req.optional_item_notes_2,
      url_key: '', // TODO: 仕様確定待ち
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
          delete_flag: DeletionStatus.ACTIVE,
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
          delete_flag: DeletionStatus.ACTIVE,
          deduction_flag: item.deduction_flag ? SelectType.SELECTED : SelectType.UNSELECTED,
          credit_flag: item.credit_flag ? SelectType.SELECTED : SelectType.UNSELECTED,
          paypay_flag: item.paypay_flag ? SelectType.SELECTED : SelectType.UNSELECTED,
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
    return { success: true, data: newCompanyId };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    // Rollback
    await rollbackWithLog(client);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  } finally {
    // Transaction End
    await client.end();
  }
};

/**
 * update_companyDetail
 * Transaction専用・会社情報をUPDATEする。
 * @param {ApiRequest<CompanyDetailFormValues>} values - 入力内容
 * @returns {Promise<ApiResponse<number>>} 企業ID
 */
export const _updateComponyDetail = async (values: CompanyDetailFormValues): Promise<ApiResponse<number>> => {
  const client = createPgClient();

  const req = values;
  const timestamp = getNow();

  try {
    // connection Start
    await client.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await client.query('BEGIN');

    /* Update - t_companies
  　------------------------------------------------------------------ */
    // UpdateData setting
    const updateValues: Omit<t_companies, 'id' | 'url_key' | 'created_at'> = {
      company_name: req.company_name,
      branch_name: req.branch_name,
      postal_code: req.postal_code_prefix + req.postal_code_suffix,
      address: req.address,
      area_block_number: req.area_block_number,
      building_name: req.building_name,
      restaurant_name: req.restaurant_name,
      location: req.location,
      email: req.email,
      memo: req.memo,
      domain: req.domain.map((m) => m.name),
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

    // Update
    const result = await client.query(updateCompanyText, values);

    if (result.rowCount === 0) {
      const errorMsg = '企業情報の更新' + ERROR_MESSAGE.TEMPLATE;
      console.error(errorMsg);
      throw new Error(errorMsg);
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
            const errorMsg = '企業部署情報の削除' + ERROR_MESSAGE.TEMPLATE;
            console.log(errorMsg);
            throw new Error(errorMsg);
          }
        }
      }

      if (updateList) {
        for (const item of updateList) {
          const updateCompanyText = `UPDATE t_companies_department SET department_name = $1, updated_at = $2 WHERE id = $3;`;
          const res = await client.query(updateCompanyText, [item.name, timestamp, item.id]);
          if (res.rowCount === 0) {
            const errorMsg = '企業部署情報の更新' + ERROR_MESSAGE.TEMPLATE;
            console.log(errorMsg);
            throw new Error(errorMsg);
          }
        }
      }

      if (insertList) {
        for (const item of insertList) {
          const insertValuesDep: Omit<t_companies_department, 'id' | 'created_at' | 'updated_at'> = {
            t_companies_id: updatedId,
            department_name: item.name,
            delete_flag: DeletionStatus.ACTIVE,
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
            const errorMsg = '企業部署情報の新規登録' + ERROR_MESSAGE.TEMPLATE;
            console.log(errorMsg);
            throw new Error(errorMsg);
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
          // const ress = await client.query({text:deleteCompanyText, values:[timestamp, item.id]});
          if (res.rowCount === 0) {
            const errorMsg = '企業雇用形態情報の削除' + ERROR_MESSAGE.TEMPLATE;
            console.log(errorMsg);
            throw new Error(errorMsg);
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
            item.deduction_flag ? SelectType.SELECTED : SelectType.UNSELECTED,
            item.credit_flag ? SelectType.SELECTED : SelectType.UNSELECTED,
            item.paypay_flag ? SelectType.SELECTED : SelectType.UNSELECTED,
            item.set_meal_burden,
            timestamp,
            item.id,
          ]);
          if (res.rowCount === 0) {
            const errorMsg = '企業雇用形態情報の新規登録' + ERROR_MESSAGE.TEMPLATE;
            console.error(errorMsg);
            throw new Error(errorMsg);
          }
        }
      }
      if (insertList) {
        for (const item of insertList) {
          const insertValuesEmp: Omit<t_companies_employment_status, 'id' | 'created_at' | 'updated_at'> = {
            t_companies_id: updatedId,
            employment_status_name: item.employment_status_name,
            delete_flag: DeletionStatus.ACTIVE,
            deduction_flag: item.deduction_flag ? SelectType.SELECTED : SelectType.UNSELECTED,
            credit_flag: item.credit_flag ? SelectType.SELECTED : SelectType.UNSELECTED,
            paypay_flag: item.paypay_flag ? SelectType.SELECTED : SelectType.UNSELECTED,
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
            const errorMsg = '企業雇用形態情報の新規登録' + ERROR_MESSAGE.TEMPLATE;
            console.log(errorMsg);
            throw new Error(errorMsg);
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
    return { success: true, data: updatedId };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    // Rollback
    await rollbackWithLog(client);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  } finally {
    // Transaction End
    await client.end();
  }
};
