'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, FormControlLabel, Paper, Switch, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormContainer, SelectElement, TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { MockDataCreate_CompanySearchResult } from '@/app/_lib/createMockData';
import { getLastMonthEndDay, getLastMonthStartDay, getToday, getTomorrow, getYesterday } from '@/app/_lib/getDateTime';
import { CompanySearchFormValues, CompanySearchSchema } from '@/app/_types/types';

import { state as stateMockData } from '../../../public/state.json';
import ItemBase from '../../_ui/_shared/itemBase';
import CompanyResult from './parts/companyResult';

/** ページ名 */
const pageName = '会社一覧';
const resultHeader = ['会社名', '支店名', '住所', 'ステータス'];

export const CompanyComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();

  /* useState
  ------------------------------------------------------------------ */
  const [isSearch, setIsSearch] = useState(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, reset, control, setValue } = useForm<CompanySearchFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(CompanySearchSchema),
    defaultValues: {
      companyName: '',
      branchName: '',
      state: '',
      city: '',
      town: '',
      status: '',
    },
  });

  /* functions 
  ------------------------------------------------------------------ */
  // 検索ハンドラ
  const searchHandler = () => {
    setIsSearch(!isSearch);
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    router.push(`/companyDetail/${id}`);
    reset();
  };

  // リセット
  const onResetClick = () => {
    reset();
  };

  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  const result = MockDataCreate_CompanySearchResult();
  // 都道府県(モックから取得)
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
              <ItemBase name={'会社名'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <TextFieldElement control={control} size="small" color={'primary'} name="companyName" fullWidth />
                </Box>
              </ItemBase>
              <ItemBase name={'支店名'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <TextFieldElement control={control} size="small" color={'primary'} name="branchName" fullWidth />
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
                      { id: '10', label: '契約ステータス1' },
                      { id: '20', label: '契約ステータス2' },
                      { id: '30', label: '契約ステータス3' },
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
            {isSearch && (
              <>
                <Divider sx={{ my: 3 }} />
                <CompanyResult header={resultHeader} result={result} linkHandler={linkHandler} />
              </>
            )}
          </form>
        </Box>
      </Paper>
    </>
  );
};
