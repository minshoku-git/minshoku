'use client';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FormContainer, SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { MockDataCreate_ShopSearchResult } from '@/app/_lib/mockDataCreate';

import { state as stateMockData } from '../../../public/state.json';
import ItemBase from '../../_ui/shared/ItemBase';
import ShopResult from './parts/shopResult';

/** ページ名 */
const pageName = '店舗一覧';
const resultHeader = ['店舗名', '会社名', '住所', 'ステータス'];

/* 店舗一覧 検索条件 */
export type ShopSearchFormValues = {
  /* 店舗名 */
  shopName: string;
  /* 都道府県 */
  state: string;
  /* 市 */
  city: string;
  /* 町村 */
  town: string;
  /* ステータス */
  status: string;
};

/* TODO: タイプ定義ファイルに移動 */
export type ShopSearchResult = {
  id: string;
  shopName: string;
  companyName: string;
  address: string;
  status: string;
};

export const UserComponent = () => {
  const router = useRouter();
  const [isSearch, setIsSearch] = useState(false);

  const { reset, control } = useForm<ShopSearchFormValues>({
    defaultValues: {
      shopName: '',
      state: '',
      city: '',
      town: '',
      status: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const stateData = [
    { id: '', label: '未選択' },
    ...stateMockData.map((d: string, index: number) => {
      return { id: index.toString(), label: d };
    }),
  ];

  // 検索ハンドラ
  const searchHandler: SubmitHandler<ShopSearchFormValues> = (data) => {
    // chipを表示しよう
    // openSnackbar(
    //   AlertType.INFO,
    //   `検索ボタンが押されました...
    //    名：${data.firstName}, 姓：${data.lastName}, 予約日:${data.date}`
    // );
    console.log('addHandler click!!');
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    router.push('/shopDetail');
    reset();
  };

  // リセット
  const onResetClick = () => {
    reset();
  };

  // MockData
  const result = MockDataCreate_ShopSearchResult();

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
          <FormContainer onSuccess={searchHandler}>
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
                      { id: '', label: '未選択' },
                      { id: '10', label: '市区1' },
                      { id: '20', label: '市区2' },
                      { id: '30', label: '市区3' },
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
                  px: 1,
                  whiteSpace: 'nowrap',
                  textDecoration: 'underline',
                }}
              >
                検索項目をリセット
              </Button>
            </Grid>
            <Grid sx={{ mt: 1 }} size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setIsSearch(!isSearch);
                }}
              >
                検索
              </Button>
            </Grid>
            {isSearch && result && (
              <>
                <Divider sx={{ my: 3 }} />
                <ShopResult header={resultHeader} result={result} linkHandler={linkHandler} />
              </>
            )}
          </FormContainer>
        </Box>
      </Paper>
    </>
  );
};
