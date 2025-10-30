'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TableCell, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery } from '@tanstack/react-query';
import { ja } from 'date-fns/locale';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { getTodayXHour, getTomorrow, getYesterday } from '@/app/_lib/utils/getDateTime';
import { AlertType, SearchType, SortType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, HeaderStatus } from '@/app/_types/types';
import ItemBase from '@/app/_ui/components/atoms/itemBase';
import { ResultsCounter } from '@/app/_ui/components/atoms/resultsCounter';
import { CustomTable } from '@/app/_ui/components/organisms/customTable/customTable';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

import { searchScheduleListFetcher } from './_lib/fetcher';
import { ScheduleListSearchResult, ScheduleSearchFormValues, ScheduleSearchSchema } from './_lib/types';

/** ページ名 */
const pageName: string = 'スケジュール一覧';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: '配達日', variableName: 'delivery_day', sort: SortType.ASC },
  { name: '会社名 / 支店名', variableName: 'company_name', sort: SortType.ASC },
  { name: '店舗名', variableName: 'shop_name', sort: SortType.ASC },
  { name: 'メニュー名', variableName: 'menu_name', sort: SortType.ASC },
  { name: '食数', variableName: 'order_count', sort: SortType.ASC },
];

/**
 * スケジュール一覧Component
 * @returns {JSX.Element} JSX
 */
export const ScheduleComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  /* 検索種別 */
  const [searchType, setSearchType] = useState<SearchType>(SearchType.SEARCH);
  /* ソート配列 */
  const [sortArray, setSortArray] = useState<HeaderStatus[]>(resultHeader);
  /* 現在のソート対象項目 */
  const [sortTarget, setSortTarget] = useState<HeaderStatus>(resultHeader[0]);

  /* 検索状態 */
  const [isSearch, setIsSearch] = useState(false);
  /* 検索条件/検索結果 */
  const [condition, setCondition] = useState<ApiRequest<ScheduleSearchFormValues> | null>(null);
  const [result, setResult] = useState<ApiResponse<ScheduleListSearchResult> | null>(null);

  /* useForm
  ------------------------------------------------------------------ */
  const { reset, control, setValue, handleSubmit } = useForm<ScheduleSearchFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(ScheduleSearchSchema),
    defaultValues: {
      deliveryFrom: getTodayXHour(),
      deliveryTo: getTodayXHour(),
      company_name: '',
      shop_name: '',
    },
  });

  /* handler
  ------------------------------------------------------------------ */
  /** 日付設定（本日以降）ハンドラ */
  const onAfterTodayClick = () => {
    setValue('deliveryFrom', getTodayXHour());
    setValue('deliveryTo', null);
  };

  /** 日付設定（本日）ハンドラ */
  const onTodayClick = () => {
    setValue('deliveryFrom', getTodayXHour());
    setValue('deliveryTo', getTodayXHour());
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
    setValue('deliveryFrom', getTodayXHour());
    setValue('deliveryTo', getTodayXHour());
  };

  /* useQuery
  ------------------------------------------------------------------ */
  const { data, isFetching, refetch, isError } = useQuery<ApiResponse<ScheduleListSearchResult>>({
    queryKey: [QUERY_KEYS.SCHEDULE_SEARCH_RESULT, condition],
    queryFn: () => searchScheduleListFetcher(condition),
    enabled: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    // condition変化時に検索を実行
    if (condition !== null) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  useEffect(() => {
    if (isFetching) {
      openProcessing();
    } else {
      closeProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);

  useEffect(() => {
    if (!data) {
      return;
    }
    if (!data.success) {
      openSnackbar(AlertType.ERROR, data.error.message);
      setResult(null);
      setIsSearch(false);
      return;
    }
    if (searchType === SearchType.SEARCH) {
      setSortArray(resultHeader);
      setSortTarget(resultHeader[0]);
    }
    if (searchType === SearchType.SORT) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    setIsSearch(true);
    setResult(data ?? null);
    closeProcessing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* functions
  ------------------------------------------------------------------ */
  /** 検索 */
  const searchHandler: SubmitHandler<ScheduleSearchFormValues> = async (data) => {
    const req: ApiRequest<ScheduleSearchFormValues> = {
      request: data,
      sortItems: {
        nextPage: 1,
        sortColumn: 'delivery_day',
        ascending: true,
      },
    };
    setSearchType(SearchType.SEARCH);
    setCondition(req);
  };

  /** ソート */
  const sortHandler = async (sortColumn: string, ascending: boolean) => {
    openProcessing();
    const req: ApiRequest<ScheduleSearchFormValues> = {
      request: condition?.request ?? initConditionValues.request,
      sortItems: {
        nextPage: 1,
        sortColumn: sortColumn,
        ascending: ascending,
      },
    };
    setSearchType(SearchType.SORT);
    setCondition(req);
  };

  /** ページネーション */
  const pageChangeHandler = async (_event: React.ChangeEvent<unknown>, nextPage: number) => {
    openProcessing();
    const req: ApiRequest<ScheduleSearchFormValues> = {
      request: condition?.request ?? initConditionValues.request,
      sortItems: {
        nextPage: nextPage ?? 0,
        sortColumn: condition?.sortItems?.sortColumn ?? 'delivery_day',
        ascending: condition?.sortItems?.ascending ?? true,
      },
    };
    setSearchType(SearchType.PAGENATION);
    setCondition(req);
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
              <ItemBase name={'会社名 / 支店名'} isRequired={2}>
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
          {isSearch && result?.success && (
            <>
              <Divider sx={{ my: 3 }} />
              {result.paginate?.count && result.paginate?.count > 0 ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'end' }}>
                    {/* 検索件数 */}
                    <ResultsCounter
                      startRow={result.paginate?.startRow}
                      endRow={result.paginate?.endRow}
                      count={result.paginate?.count}
                    />
                    {/* 合計食数 */}
                    <Typography sx={{ fontSize: '14px', ml: 2 }}>合計食数 : {result.data?.orderAmout ?? 0}</Typography>
                  </Box>
                </>
              ) : (
                <></>
              )}
              <CustomTable
                paginate={result.paginate}
                sortHandler={sortHandler}
                pageChangeHandler={pageChangeHandler}
                header={resultHeader}
                sortArray={sortArray}
                setSortArray={setSortArray}
                sortTarget={sortTarget}
                setSortTarget={setSortTarget}
                renderBody={() =>
                  /* 検索結果 */
                  result.data?.scheduleDatas.map((row, index) => (
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
                        {row.stock_count}
                      </TableCell>
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

const initConditionValues: ApiRequest<ScheduleSearchFormValues> = {
  request: {
    deliveryFrom: getTodayXHour(),
    deliveryTo: getTodayXHour(),
    company_name: '',
    shop_name: '',
  },
  sortItems: {
    nextPage: 1,
    sortColumn: 'delivery_day',
    ascending: true,
  },
};
