'use server';

import { getAllTodoName } from '@/app/_lib/supabase/supabaseFunction';

import {
  get_companyDetail,
  insert_companyDetail,
  search_companyList,
} from '../_lib/supabase/functions/companyFunction';
import {
  get_shopDetail,
  insert_shopDetail,
  search_shopList,
  update_shopDetail,
} from '../_lib/supabase/functions/shopFunction';
import { search_userList } from '../_lib/supabase/functions/userFuction';
import { insert_companyDetail_TEST, update_companyDetail_TEST } from '../_lib/supabase/traTest';
import { ApiRequest } from '../_lib/supabase/types';
import {
  CompanyDetailFormValues,
  CompanySearchFormValues,
  ShopDetailFormValues,
  ShopSearchFormValues,
  UserSearchFormValues,
} from '../_types/types';

/* おためしでつくったやつ※のちすて
------------------------------------------------------------------ */
export async function getAllTodoNameAction() {
  return await getAllTodoName();
}

/* 店舗検索
------------------------------------------------------------------ */
export async function searchShopList(value: ApiRequest<ShopSearchFormValues>) {
  return await search_shopList(value);
}

/* 店舗詳細
------------------------------------------------------------------ */
export async function getShopDetail(value: ApiRequest<number>) {
  return await get_shopDetail(value);
}

export async function insertShopDetail(value: ApiRequest<ShopDetailFormValues>) {
  return await insert_shopDetail(value);
}

export async function updateShopDetail(value: ApiRequest<ShopDetailFormValues>) {
  return await update_shopDetail(value);
}

/* 会社検索
------------------------------------------------------------------ */
export async function searchComponyList(value: ApiRequest<CompanySearchFormValues>) {
  return await search_companyList(value);
}

/* 会社詳細
------------------------------------------------------------------ */
export async function getComponyDetail(value: ApiRequest<number>) {
  return await get_companyDetail(value);
}

export async function insertComponyDetail(value: ApiRequest<CompanyDetailFormValues>) {
  return await insert_companyDetail(value);
}

export async function insertComponyDetailTEST(value: ApiRequest<CompanyDetailFormValues>) {
  return await insert_companyDetail_TEST(value);
}

export async function updateComponyDetailTEST(value: ApiRequest<CompanyDetailFormValues>) {
  return await update_companyDetail_TEST(value);
}

/* ユーザー検索
------------------------------------------------------------------ */
export async function searchUserList(value: ApiRequest<UserSearchFormValues>) {
  return await search_userList(value);
}
