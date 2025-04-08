'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Hidden, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CSVDownload, CSVLink } from 'react-csv';
import { CommonPropTypes } from 'react-csv/components/CommonPropTypes';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FormContainer, SelectElement, TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { MockDataCreate_OrderResult } from '@/app/_lib/createMockData';
import { getLastMonthEndDay, getLastMonthStartDay, getToday, getTomorrow, getYesterday } from '@/app/_lib/getDateTime';
import TestComponent from '@/app/(authenticated)/otamesi/component';

import { OrderSearchFormValues, OrderSearchSchema } from '../../_types/types';
import ItemBase from '../../_ui/shared/ItemBase';
import OrderResult from './parts/orderResult';

/** ページ名 */
const pageName = 'オーダー一覧';
/** ヘッダー */
const resultHeader = ['配達日', 'ユーザー名', '会社名', '食数', '金額', '決済方法'];

/**
 * オーダー一覧Component
 */
export const OrderComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();

  /* useState
  ------------------------------------------------------------------ */
  // 検索状態
  const [isSearch, setIsSearch] = useState(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { reset, control, setValue, handleSubmit } = useForm<OrderSearchFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(OrderSearchSchema),
    defaultValues: {
      deliveryFrom: getToday(),
      deliveryTo: getToday(),
      userName: '',
      companyName: '',
      branchName: '',
      status: '',
    },
  });

  /* handler
  ------------------------------------------------------------------ */
  /** 日付設定（先月）ハンドラ */
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

  /** 検索条件リセットハンドラ */
  const onResetClick = () => {
    reset();
    setValue('deliveryFrom', getToday());
    setValue('deliveryTo', getToday());
  };

  /** 検索ハンドラ */
  const searchHandler: SubmitHandler<OrderSearchFormValues> = (data) => {
    setIsSearch(!isSearch);
  };

  /** 明細行リンクハンドラ */
  const linkHandler = (id: string) => {
    // TODO:具体的な遷移方法を考える。idでデータを管理する？
    router.push('/userDetail');
    reset();
  };

  /* csvPrinter 
  ------------------------------------------------------------------ */
  const headers = [
    { label: 'First Name', key: 'firstname' },
    { label: 'Last Name', key: 'lastname' },
    { label: 'Email', key: 'email' },
  ];

  const data = [
    { firstname: 'Ahmed', lastname: 'Tomi', email: 'ah@smthing.co.com' },
    { firstname: 'Raed', lastname: 'Labes', email: 'rl@smthing.co.com' },
    { firstname: 'Yezzi', lastname: 'Min l3b', email: 'ymin@cocococo.com' },
  ];

  const csvPrintHandler = () => {
    // 謎errorが出る件は岩瀬さんに質問する
    // suppressHydrationWarning
    document.getElementById('csvLinkButton')?.click();
  };

  /* MockData ※のちすて
  ------------------------------------------------------------------ */
  const result = MockDataCreate_OrderResult();

  /* DOM
  ------------------------------------------------------------------ */
  return (
    <>
      {/* テスト用ボタン※のちすて */}
      {/* <CSVLink
        id="csvLinkButton"
        filename="テストCSV"
        data={data}
        headers={headers}
        enclosingCharacter=","
        uFEFF={false}
        hidden
        suppressHydrationWarning
      >
        Download me
      </CSVLink>
      <TestComponent />
      <Button onClick={csvPrintHandler}>テスト</Button> */}
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
            <Grid container rowSpacing={2} columnSpacing={{ xs: 1 }} direction="column" sx={{ alignContent: 'center' }}>
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
                    </Box>
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
                <OrderResult header={resultHeader} result={result} linkHandler={linkHandler} />
              </>
            )}
          </form>
        </Box>
      </Paper>
    </>
  );
};
