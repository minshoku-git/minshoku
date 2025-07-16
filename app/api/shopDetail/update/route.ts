import { NextRequest, NextResponse } from 'next/server';

import { _updateShopDetail } from '@/app/(private)/shopDetail/[id]/_lib/shopDetailFunction';
import { ShopDetailFormValues, shopDeteilRequestData } from '@/app/(private)/shopDetail/[id]/_lib/types';

export async function PUT(req: NextRequest) {
  const formData = await req.formData();

  const formValues = formData.get('formValues') as string;
  const shop_image_file_data = formData.get('shop_image_file_data') as File | undefined;
  const shop_image_file_name = formData.get('shop_image_file_name') as string | null;
  const shop_image_file_bytesize = formData.get('shop_image_file_bytesize') as unknown as number;

  const data: ShopDetailFormValues = await JSON.parse(formValues);

  const request: shopDeteilRequestData = {
    ...data,
    shop_image_file_data: shop_image_file_data,
    shop_image_file_name: shop_image_file_name ?? '',
    shop_image_file_bytesize: shop_image_file_bytesize ?? 0,
  };

  const result = await _updateShopDetail(request);

  return NextResponse.json(result);
}
