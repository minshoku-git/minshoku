import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import { getEditFlag } from '@/app/_lib/utill';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { _searchCompanyDetail } from './_lib/companyDetailFunction';
import { CompanyDataDetailResult } from './_lib/types';
import { CompanyComponent } from './component';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!getEditFlag(id)) {
    return <CompanyComponent id={id} data={null} />;
  }

  let data: ApiResponse<CompanyDataDetailResult> | null = null;
  try {
    data = await _searchCompanyDetail({ request: Number(id) });
  } catch (e) {
    console.error('サーバーAPI取得失敗', e);
    data = { error: (e as Error).message, data: null };
  } finally {
    return <CompanyComponent id={id} data={data} />;
  }
}
