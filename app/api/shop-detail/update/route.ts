import { NextRequest, NextResponse } from 'next/server';

import { validateObject } from '@/app/_lib/validation';
import { updateShopDetail } from '@/app/(private)/shop-detail/[id]/_lib/shopDetailFunction';
import { ShopDetailApiSchema } from '@/app/(private)/shop-detail/[id]/_lib/types';

export async function PUT(req: NextRequest) {
  const formData = await req.formData();

  // 1. 各パーツを抽出
  const formValues = formData.get('formValues') as string;
  const data = JSON.parse(formValues);

  // 2. スキーマの構造 { request: { ... } } に合わせて組み立てる
  const payload = {
    request: {
      ...data,
      shop_image_file_data: formData.get('shop_image_file_data'),
      shop_image_file_name: formData.get('shop_image_file_name') || '',
      shop_image_file_bytesize: Number(formData.get('shop_image_file_bytesize') || 0),
    },
  };

  // --- 1. リクエスト検証 ---
  const validationResult = validateObject(payload, ShopDetailApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  // --- 2. データ取得・加工 ---
  const result = await updateShopDetail(validationResult.data.request);

  // --- 3. レスポンス返却 ---
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
