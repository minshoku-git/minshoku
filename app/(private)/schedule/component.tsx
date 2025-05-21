'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TableCell, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { MockDataCreate_ScheduleResult } from '@/app/_lib/createMockData';
import { getToday, getTomorrow, getYesterday } from '@/app/_lib/getDateTime';
import { ApiRequest, ApiResponse, SearchResult_ScheduleList } from '@/app/_lib/supabase/types';
import { AlertType, SortType, UserUsageStatus } from '@/app/_types/enum';
import { HeaderStatus, ScheduleSearchFormValues, ScheduleSearchSchema } from '@/app/_types/types';
import { CustomTable } from '@/app/_ui/_shared/costomTable/customTable';
import ItemBase from '@/app/_ui/_shared/itemBase';
import { ResultsCounter } from '@/app/_ui/_shared/resultsCounter';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

/** ページ名 */
const pageName: string = 'スケジュール一覧';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: '配達日', variableName: 'delivery_day', sort: SortType.ASC },
  { name: '会社名 / 支店名', variableName: 'company_name', sort: SortType.ASC },
  { name: '店舗名', variableName: 'shop_name', sort: SortType.ASC },
  { name: 'メニュー名', variableName: 'menu_name', sort: SortType.ASC },
  { name: '食数', variableName: 'count', sort: SortType.ASC },
  { name: 'アレルギー', variableName: 'allergies', sort: SortType.ASC },
];

/**
 * スケジュール一覧Component
 * @returns {JSX.Element} JSX
 */
export const ScheduleComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  const [isSearch, setIsSearch] = useState(false); // 検索状態
  const [condition, setCondition] = useState<ApiRequest<ScheduleSearchFormValues>>({
    request: {
      company_name: '',
      shop_name: '',
      deliveryFrom: getToday(),
      deliveryTo: getToday(),
    },
    sortItems: {
      nextPage: 1,
      sortColumn: 'company_name',
      ascending: true,
    },
  });
  const [result, setResult] = useState<ApiResponse<SearchResult_ScheduleList[]> | null>({
    data: null,
    error: null,
    paginate: {
      count: 0,
      currentPage: 0,
      startRow: 0,
      endRow: 0,
      totalPage: 0,
    },
  });
  /* useForm
  ------------------------------------------------------------------ */
  const { reset, control, setValue, handleSubmit } = useForm<ScheduleSearchFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(ScheduleSearchSchema),
    defaultValues: {
      deliveryFrom: getToday(),
      deliveryTo: getToday(),
      company_name: '',
      shop_name: '',
    },
  });

  /* handler
  ------------------------------------------------------------------ */
  /** 日付設定（本日以降）ハンドラ */
  const onAfterTodayClick = () => {
    setValue('deliveryFrom', getToday());
    setValue('deliveryTo', null);
  };

  /** 日付設定（本日）ハンドラ */
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
  const searchHandler: SubmitHandler<ScheduleSearchFormValues> = async (data) => {
    openProcessing();
    const req: ApiRequest<ScheduleSearchFormValues> = {
      request: data,
      sortItems: {
        nextPage: 1,
        sortColumn: 'delivery_day',
        ascending: true,
      },
    };
    // const res = await searchScheduleList(req);
    // todo: 差し替え
    const res: ApiResponse<SearchResult_ScheduleList[]> = {
      error: '',
      data: MockDataCreate_ScheduleResult(),
      paginate: { count: 30, currentPage: 1, endRow: 30, startRow: 1, totalPage: 1 },
    };
    if (res.error) {
      openSnackbar(AlertType.ERROR, '検索時にエラーが発生しました。再度発生する場合は、管理者にお問い合わせください。');
      setResult(null);
      setIsSearch(false);
    } else {
      setCondition(req);
      setResult(res);
      setIsSearch(true);
    }
    closeProcessing();
  };

  /* DOM
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
                    onClick={onAfterTodayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
                      h: 40,
                    }}
                  >
                    本日以降
                  </Button>
                  <Button
                    onClick={onYesterdayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 0.5,
                      px: 1,
                      whiteSpace: 'nowrap',
                      h: 40,
                    }}
                  >
                    昨日
                  </Button>
                  <Button
                    onClick={onTodayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
                      h: 40,
                    }}
                  >
                    本日
                  </Button>
                  <Button
                    onClick={onTomorrowClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 0.5,
                      px: 1,
                      whiteSpace: 'nowrap',
                      h: 40,
                    }}
                  >
                    明日
                  </Button>
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="company_name" fullWidth />
                </Box>
              </ItemBase>
              <ItemBase name={'店舗名'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <TextFieldElement control={control} size="small" color={'primary'} name="shop_name" fullWidth />
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
          </form>
          {isSearch && result && (
            <>
              <Divider sx={{ my: 3 }} />
              {result.paginate?.count && result.paginate?.count > 0 && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'end' }}>
                    {/* 検索件数 */}
                    <ResultsCounter startRow={result.paginate?.startRow} endRow={result.paginate?.endRow} count={result.paginate?.count} />
                    {/* 合計食数 */}
                    <Typography sx={{ fontSize: '14px', ml: 2 }}>合計食数 : 1000</Typography>
                  </Box>
                </>
              )}
              <CustomTable
                paginate={result.paginate}
                header={resultHeader}
                sortHandler={() => { }}
                pageChangeHandler={() => { }}
                renderBody={() =>
                  /* 検索結果 */
                  result.data?.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ whiteSpace: 'pre' }}>{row.delivery_day}</TableCell>
                      <TableCell>
                        {row.company_name}
                        <br />
                        {row.branch_name}
                      </TableCell>
                      <TableCell>{row.shop_name}</TableCell>
                      <TableCell>{row.menu_name}</TableCell>
                      <TableCell sx={{ width: '20px' }} align="right">
                        {row.count}
                      </TableCell>
                      <TableCell sx={{ width: '20px' }}>{row.allergies.join(' / ')}</TableCell>
                    </TableRow>
                  ))
                }
              />
            </>
          )}
        </Box>
      </Paper>
    </>
  );
};
