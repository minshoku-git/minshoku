'use client';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormContainer, SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { MockDataCreate_CompanySearchResult, MockDataCreate_OrderResult } from '@/app/_lib/createMockData';

import { OrderSearchFormValues } from '../../_types/types';
import ItemBase from '../../_ui/shared/ItemBase';
import CompanyResult from './parts/companyResult';

/** ページ名 */
const pageName = '会社一覧';
const resultHeader = ['会社名', '支店名', '住所', '契約ステータス'];

export const CompanyComponent = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const { reset, control } = useForm<OrderSearchFormValues>({
    defaultValues: {
      deliveryFrom: '',
      deliveryTo: '',
      userName: '',
      companyName: '',
      branchName: '',
      status: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // 配達日
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());

  // 先月
  const onLastMonthClick = () => {
    // TODO: 両方未入力の場合は検索できないようにする
    // TODO: 前の月の1日と最終日を設定する
    setDateFrom(subMonths(dateFrom, 1));
    setDateTo(subMonths(dateTo, 1));
  };

  // 今日
  const onTodayClick = () => {
    setDateFrom(new Date());
    setDateTo(new Date());
  };

  // 明日
  const onTomorrowClick = () => {
    setDateFrom(
      new Date(dateFrom.getFullYear(), dateFrom.getMonth(), parseInt(('00' + dateFrom.getDate()).slice(-2)) + 1)
    );
    setDateTo(new Date(dateTo.getFullYear(), dateTo.getMonth(), parseInt(('00' + dateTo.getDate()).slice(-2)) + 1));
  };

  // 昨日
  const onYesterdayClick = () => {
    setDateFrom(
      new Date(dateFrom.getFullYear(), dateFrom.getMonth(), parseInt(('00' + dateFrom.getDate()).slice(-2)) - 1)
    );
    setDateTo(new Date(dateTo.getFullYear(), dateTo.getMonth(), parseInt(('00' + dateTo.getDate()).slice(-2)) - 1));
  };

  const searchHandler = () => {
    setIsSearch(true);
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    router.push('/companyDetail');
    reset();
  };

  // リセット
  const onResetClick = () => {
    reset();
    setDateFrom(new Date());
    setDateTo(new Date());
  };

  // MockData
  const result = MockDataCreate_CompanySearchResult();

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
              <ItemBase name={'配達日'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                    <DatePicker
                      name={'dateFrom'}
                      value={dateFrom}
                      sx={{ minWidth: '150px' }}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                    <Typography sx={{ mx: 1 }}>{' ～ '}</Typography>
                    <DatePicker
                      name={'dateTo'}
                      value={dateTo}
                      sx={{ minWidth: '150px' }}
                      slotProps={{ textField: { size: 'small' } }}
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
            {isSearch && (
              <>
                <Divider sx={{ my: 3 }} />
                <CompanyResult header={resultHeader} result={result} linkHandler={linkHandler} />
              </>
            )}
          </FormContainer>
        </Box>
      </Paper>
    </>
  );
};
