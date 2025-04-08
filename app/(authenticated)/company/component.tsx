'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormContainer, SelectElement, TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { MockDataCreate_CompanySearchResult } from '@/app/_lib/createMockData';
import { getLastMonthEndDay, getLastMonthStartDay, getToday, getTomorrow, getYesterday } from '@/app/_lib/getDateTime';
import { CompanySearchFormValues, CompanySearchSchema } from '@/app/_types/types';

import ItemBase from '../../_ui/shared/ItemBase';
import CompanyResult from './parts/companyResult';

/** ページ名 */
const pageName = '会社一覧';
const resultHeader = ['会社名', '支店名', '住所', '契約ステータス'];

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
      deliveryFrom: getToday(),
      deliveryTo: getToday(),
      userName: '',
      companyName: '',
      branchName: '',
      status: '',
    },
  });

  /* functions 配達日各種ボタン
  ------------------------------------------------------------------ */
  // 先月
  const onLastMonthClick = () => {
    setValue('deliveryFrom', getLastMonthStartDay());
    setValue('deliveryTo', getLastMonthEndDay());
  };

  /** 日付設定（今日）ハンドラ */
  const onTodayClick = () => {
    setValue('deliveryFrom', getToday());
    setValue('deliveryTo', getToday());
  };

  /** 日付設定（明日）ハンドラ */
  const onTomorrowClick = () => {
    setValue('deliveryFrom', getTomorrow());
    setValue('deliveryTo', getTomorrow());
  };

  /** 日付設定（昨日）ハンドラ */
  const onYesterdayClick = () => {
    setValue('deliveryFrom', getYesterday());
    setValue('deliveryTo', getYesterday());
  };

  /* functions 
  ------------------------------------------------------------------ */
  // 検索ハンドラ
  const searchHandler = () => {
    setIsSearch(!isSearch);
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    router.push('/companyDetail');
    reset();
  };

  // リセット
  const onResetClick = () => {
    reset();
    setValue('deliveryFrom', getToday());
    setValue('deliveryTo', getToday());
  };

  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  const result = MockDataCreate_CompanySearchResult();

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
              <ItemBase name={'配達日'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    width: '640px',
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                    <DatePickerElement
                      control={control}
                      name={'deliveryFrom'}
                      sx={{
                        minWidth: '150px',
                        '& .MuiInputBase-root': {
                          height: '40px',
                          textAlign: 'center',
                          verticalAlign: 'center',
                          padding: '0 15px',
                        },
                        '& input': {
                          padding: '0',
                        },
                      }}
                    />
                    <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mx: 1 }}>{'～'}</Typography>
                    </Box>{' '}
                    <DatePickerElement
                      control={control}
                      name={'deliveryTo'}
                      sx={{
                        minWidth: '150px',
                        '& .MuiInputBase-root': {
                          height: '40px',
                          textAlign: 'center',
                          verticalAlign: 'center',
                          padding: '0 15px',
                        },
                        '& input': {
                          padding: '0',
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <Button
                    onClick={onLastMonthClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    先月
                  </Button>
                  <Button
                    onClick={onTodayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    今日
                  </Button>
                  <Button
                    onClick={onYesterdayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 0.5,
                      px: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    昨日
                  </Button>
                  <Button
                    onClick={onTomorrowClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 0.5,
                      px: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    明日
                  </Button>
                </Box>
              </ItemBase>
              <ItemBase name={'ユーザー名'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <TextFieldElement control={control} size="small" color={'primary'} name="userName" fullWidth />
                </Box>
              </ItemBase>
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
              <ItemBase name={'契約ステータス'} isRequired={2}>
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
