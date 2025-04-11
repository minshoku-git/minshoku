'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { MockDataCreate_ShopSearchResult } from '@/app/_lib/createMockData';
import { ShopSearchFormValues, ShopSearchSchema } from '@/app/_types/types';

import { state as stateMockData } from '../../../public/state.json';
import ItemBase from '../../_ui/_shared/itemBase';
import ShopResult from './parts/shopResult';

/** ページ名 */
const pageName = '店舗一覧';
const resultHeader = ['店舗名', '会社名', '住所', 'ステータス'];

/* TODO: タイプ定義ファイルに移動 */
export type ShopSearchResult = {
  id: string;
  shopName: string;
  companyName: string;
  address: string;
  status: string;
};

export const UserComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();

  /* useState
  ------------------------------------------------------------------ */
  const [isSearch, setIsSearch] = useState(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { control, handleSubmit, reset } = useForm<ShopSearchFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(ShopSearchSchema),
    defaultValues: {
      shopName: '',
      state: '',
      city: '',
      town: '',
      status: '',
    },
  });

  /* functions
  ------------------------------------------------------------------ */
  // 検索ハンドラ
  const searchHandler: SubmitHandler<ShopSearchFormValues> = (data) => {
    setIsSearch(!isSearch);
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    router.push(`/shopDetail/${id}`);
    reset();
  };

  // リセット
  const onResetClick = () => {
    reset();
  };

  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  const result = MockDataCreate_ShopSearchResult();

  const stateData = [
    { id: '', label: '未選択' },
    ...stateMockData.map((d: string, index: number) => {
      return { id: index.toString(), label: d };
    }),
  ];

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Grid container alignItems="center">
          <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ px: 3, py: 2, mb: 0 }}>
            {pageName}
          </Typography>
        </Grid>
        <Divider />
        <Box sx={{ m: 3 }}>
          <form onSubmit={handleSubmit(searchHandler)}>
            <Grid
              container
              rowSpacing={2}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
              direction="column"
              sx={{ alignContent: 'center' }}
            >
              <ItemBase name={'店舗名'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <TextFieldElement control={control} size="small" color={'primary'} name="shopName" fullWidth />
                </Box>
              </ItemBase>
              <ItemBase name={'住所'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                  gap={2}
                >
                  <SelectElement
                    control={control}
                    size="small"
                    name="state"
                    label="都道府県"
                    fullWidth
                    options={stateData}
                  ></SelectElement>
                  <SelectElement
                    control={control}
                    size="small"
                    name="city"
                    label="市区"
                    fullWidth
                    options={[
                      { id: '', label: '未選択', value: '未選択' },
                      { id: '10', label: '市区1', value: '市区1' },
                      { id: '20', label: '市区2', value: '市区2' },
                      { id: '30', label: '市区3', value: '市区3' },
                    ]}
                  ></SelectElement>
                  <SelectElement
                    control={control}
                    size="small"
                    name="town"
                    label="町村"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: '10', label: '町村1' },
                      { id: '20', label: '町村2' },
                      { id: '30', label: '町村3' },
                    ]}
                  ></SelectElement>
                </Box>
              </ItemBase>
              <ItemBase name={'ステータス'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <SelectElement
                    control={control}
                    size="small"
                    name="status"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: '10', label: '利用可能' },
                      { id: '20', label: '利用停止' },
                    ]}
                  ></SelectElement>
                </Box>
              </ItemBase>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                onClick={onResetClick}
                sx={{
                  minWidth: 'auto',
                  ml: 'auto',
                  mt: 1,
                  whiteSpace: 'nowrap',
                  textDecoration: 'underline',
                }}
              >
                検索項目をリセット
              </Button>
            </Grid>
            <Grid sx={{ mt: 1 }} size={{ xs: 12 }}>
              <Button fullWidth variant="contained" type="submit">
                検索
              </Button>
            </Grid>
            {isSearch && result && (
              <>
                <Divider sx={{ my: 3 }} />
                <ShopResult header={resultHeader} result={result} linkHandler={linkHandler} />
              </>
            )}
          </form>
        </Box>
      </Paper>
    </>
  );
};
