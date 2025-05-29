'use server';

import { getAllTodoName } from '@/app/__notisute/supabaseFunction';

import { ApiRequest } from '../_types/types';
import { _searchComponyList } from '../(private)/company/_lib/companyFunction';
import { CompanySearchFormValues } from '../(private)/company/_lib/types';
import {
  _insertComponyDetail,
  _searchComponyDetail,
  _updateComponyDetail,
} from '../(private)/companyDetail/[id]/_lib/companyDetailFunction';
import { CompanyDetailFormValues } from '../(private)/companyDetail/[id]/_lib/types';
import {
  _insertShopDetail,
  _searchShopDetail,
  _searchShopList,
  _updateShopDetail,
} from '../(private)/shop/_lib/shopFunction';
import { ShopSearchFormValues } from '../(private)/shop/_lib/types';
import { ShopDetailFormValues } from '../(private)/shopDetail/[id]/_lib/types';
import { UserSearchFormValues } from '../(private)/user/_lib/types';
import { _searchUserList } from '../(private)/user/_lib/userFuction';
import { _searchUserDetail } from '../(private)/userDetail/[id]/_lib/userDetailFuction';

/* おためしでつくったやつ※のちすて
------------------------------------------------------------------ */
export async function getAllTodoNameAction() {
  return await getAllTodoName();
}

/* 店舗検索
------------------------------------------------------------------ */
export async function searchShopList(value: ApiRequest<ShopSearchFormValues>) {
  return await _searchShopList(value);
}

/* 店舗詳細
------------------------------------------------------------------ */
export async function searchShopDetail(value: ApiRequest<number>) {
  return await _searchShopDetail(value);
}

export async function insertShopDetail(value: ApiRequest<ShopDetailFormValues>) {
  return await _insertShopDetail(value);
}

export async function updateShopDetail(value: ApiRequest<ShopDetailFormValues>) {
  return await _updateShopDetail(value);
}

/* 会社検索
------------------------------------------------------------------ */
export async function searchComponyList(value: ApiRequest<CompanySearchFormValues>) {
  return await _searchComponyList(value);
}

/* 会社詳細
------------------------------------------------------------------ */
export async function searchComponyDetail(value: ApiRequest<number>) {
  return await _searchComponyDetail(value);
}

export async function insertComponyDetail(value: ApiRequest<CompanyDetailFormValues>) {
  return await _insertComponyDetail(value);
}

export async function updateComponyDetail(value: ApiRequest<CompanyDetailFormValues>) {
  return await _updateComponyDetail(value);
}

/* ユーザー検索
------------------------------------------------------------------ */
export async function searchUserList(value: ApiRequest<UserSearchFormValues>) {
  return await _searchUserList(value);
}

/* ユーザー詳細
------------------------------------------------------------------ */
export async function searchUserDetail(value: ApiRequest<number>) {
  return await _searchUserDetail(value);
}
