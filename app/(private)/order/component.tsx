'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TableCell, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { getLastMonthEndDay, getLastMonthStartDay, getNow, getTomorrow, getYesterday } from '@/app/_lib/getDateTime';
import { AlertType, OrderStatus, PaymentType, SearchType, SortType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { SESSION_STORAGE_KEYS } from '@/app/_types/sessionStorageKeys';
import { ApiRequest, ApiResponse, HeaderStatus } from '@/app/_types/types';
import { CustomTable } from '@/app/_ui/_shared/costomTable/customTable';
import { DownloadCsvButton } from '@/app/_ui/_shared/downloadCsv/downloadCsvButton';
import { ResultsCounter } from '@/app/_ui/_shared/resultsCounter';
import ConfirmDialog from '@/app/_ui/dirty/conformDialog';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import ItemBase from '../../_ui/_shared/itemBase';
import { orderCancel, searchOrderDetail, searchOrderList } from './_lib/fetcher';
import { orderDeteilResponseData, OrderListSearchResult, OrderSearchFormValues, OrderSearchSchema } from './_lib/types';
import OrderInfoModal from './orderInfoModal';

/* ページ名 */
const pageName = 'オーダー一覧';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: '配達日', variableName: 'delivery_day', sort: SortType.ASC },
  { name: 'ユーザー名', variableName: 'user_name', sort: SortType.ASC },
  { name: '会社名 / 支店名', variableName: 'company_name', sort: SortType.ASC },
  { name: '食数', variableName: 'count', sort: SortType.ASC },
  { name: '決済方法', variableName: 'payment_type', sort: SortType.ASC },
  { name: '注文ステータス', variableName: 'order_status', sort: SortType.ASC },
];

const initConditionValues: ApiRequest<OrderSearchFormValues> = {
  request: {
    deliveryFrom: null,
    deliveryTo: null,
    user_name: '',
    company_name: '',
    order_status: '0',
  },
  sortItems: {
    nextPage: 1,
    sortColumn: 'delivery_day',
    ascending: true,
  },
};

/**
 * オーダー一覧Component
 * @returns {JSX.Element} JSX
 */
export const OrderComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();
  const [searchType, setSearchType] = useState<SearchType>(SearchType.SEARCH);

  /* useState
  ------------------------------------------------------------------ */
  // ソート配列
  const [sortArray, setSortArray] = useState<HeaderStatus[]>(resultHeader);
  // 現在のソート対象項目
  const [sortTarget, setSortTarget] = useState<HeaderStatus>(resultHeader[0]);

  // 検索状態
  const [isSearch, setIsSearch] = useState(false);
  /* 検索条件/検索結果 */
  const [condition, setCondition] = useState<ApiRequest<OrderSearchFormValues> | null>(null);
  const [result, setResult] = useState<ApiResponse<OrderListSearchResult[]> | null>(null);
  /* 明細情報検索条件 */
  const [conditionDetail, setConditionDetail] = useState<ApiRequest<number> | null>(null);

  // 明細画面モーダル
  const [open, setOpen] = React.useState(false);

  // ステータス変更確認ダイアログ
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogActionHandler, setDialogActionHandler] = useState<() => void>(() => {
    return () => { };
  });

  /* useForm
  ------------------------------------------------------------------ */
  const { reset, control, setValue, handleSubmit } = useForm<OrderSearchFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(OrderSearchSchema),
    defaultValues: {
      deliveryFrom: getNow(),
      deliveryTo: getNow(),
      user_name: '',
      company_name: '',
      order_status: '',
    },
  });

  /* useQuery
   ------------------------------------------------------------------ */
  const { data, isFetching, refetch } = useQuery<ApiResponse<OrderListSearchResult[]>>({
    queryKey: [QUERY_KEYS.ORDER_SEARCH_RESULT, condition],
    queryFn: () => searchOrderList(condition),
    enabled: false,
  });

  const {
    data: dataDetail,
    isFetching: isFetchingDetail,
    refetch: refetchDetail,
  } = useQuery<ApiResponse<orderDeteilResponseData>>({
    queryKey: [QUERY_KEYS.ORDER_DETAIL_INIT, condition],
    queryFn: () => searchOrderDetail(conditionDetail),
    enabled: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    const searchCondition = sessionStorage.getItem(SESSION_STORAGE_KEYS.ORDER_SEARCH_CONDITION);
    const previousPath = sessionStorage.getItem(SESSION_STORAGE_KEYS.PREVIOUS_PATH);
    console.log(SESSION_STORAGE_KEYS.ORDER_SEARCH_CONDITION, searchCondition);
    if (searchCondition && previousPath === '/orderDetail') {
      const req: ApiRequest<OrderSearchFormValues> = JSON.parse(searchCondition);
      setCondition(req);
      setValue('deliveryFrom', req.request.deliveryFrom);
      setValue('deliveryTo', req.request.deliveryTo);
      setValue('user_name', req.request.user_name);
      setValue('company_name', req.request.company_name);
      setValue('order_status', req.request.order_status);
    }
    sessionStorage.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (data?.success) {
      openSnackbar(AlertType.ERROR, '検索時にエラーが発生しました。再度発生する場合は、管理者にお問い合わせください。');
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
  const searchHandler: SubmitHandler<OrderSearchFormValues> = async (data) => {
    const req: ApiRequest<OrderSearchFormValues> = {
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
    const req: ApiRequest<OrderSearchFormValues> = {
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
    const req: ApiRequest<OrderSearchFormValues> = {
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

  /** モーダル制御 */
  const openModal = async (id: number) => {
    setConditionDetail({ request: id });

    // データ取得
    const result = await refetchDetail();
    const response = result.data;

    if (!response) {
      setOpen(false);
      return;
    } else if (!response.success) {
      openSnackbar(AlertType.ERROR, response.error.message);
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  /* functions - modal
   ------------------------------------------------------------------ */
  /** キャンセルハンドラ */
  const orderCancelHandler = (id: number) => {
    // dialog setting
    setDialogActionHandler(() => {
      return () => orderCancelMutate.mutate(id);
    });
    setOpenDialog(true);
  };

  const orderCancelMutate = useMutation({
    mutationFn: async (id: number) => {
      openProcessing();
      const req: ApiRequest<number> = { request: id };
      return orderCancel(req);
    },
    onSuccess: async (res: ApiResponse<number>) => {
      if (!res.success) {
        openSnackbar(AlertType.ERROR, res.error.message);
        return;
      }
      await refetch();
      await refetchDetail();
      openSnackbar(AlertType.INFO, 'キャンセルが完了しました。');
    },
    onError: (e) => {
      console.error(e.message);
      openSnackbar(AlertType.ERROR, e.message);
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /** ユーザー詳細画面表示ハンドラ */
  const openUserDetailHandler = (id: number) => {
    window.open(`/userDetail/${id}`, '_blank', 'noopener,noreferrer');
  };

  /** 会社詳細画面表示ハンドラ */
  const openCompanyDetailHandler = (id: number) => {
    window.open(`/companyDetail/${id}`, '_blank', 'noopener,noreferrer');
  };

  /* functions - daily
  ------------------------------------------------------------------ */
  /** 日付設定（先月）ハンドラ */
  const onLastMonthClick = () => {
    setValue('deliveryFrom', getLastMonthStartDay());
    setValue('deliveryTo', getLastMonthEndDay());
  };

  /** 日付設定（本日）ハンドラ */
  const onTodayClick = () => {
    setValue('deliveryFrom', getNow());
    setValue('deliveryTo', getNow());
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
    setValue('deliveryFrom', getNow());
    setValue('deliveryTo', getNow());
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {/* ステータス変更確認ダイアログ */}
      <ConfirmDialog
        open={openDialog}
        routerPush={dialogActionHandler}
        closeConform={() => setOpenDialog(false)}
        title={'ステータス変更確認'}
        message={`注文を"キャンセル"します。\n変更後、引き戻しはできませんがよろしいですか？`}
      />
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
                    onClick={onTodayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="user_name" fullWidth />
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
              <ItemBase name={'注文ステータス'} isRequired={2}>
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
                    name="order_status"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: '10', label: '有効' },
                      { id: '20', label: 'キャンセル' },
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
            {isSearch && result?.success && (
              <>
                <Divider sx={{ my: 3 }} />
                {result.paginate?.count && result.paginate?.count > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ResultsCounter
                      startRow={result.paginate?.startRow}
                      endRow={result.paginate?.endRow}
                      count={result.paginate?.count}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <DownloadCsvButton fileName={'タイトル'} fetchAPI={''} openSnackbar={openSnackbar} />
                  </Box>
                ) : (
                  <></>
                )}
                {/* 検索結果 */}
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
                    result.data?.map((row, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{ '&:hover': { cursor: 'pointer' } }}
                        onClick={() => openModal(Number(row.id))}
                      >
                        <TableCell>{row.delivery_day}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre' }} key={index}>
                          {row.user_name_kana}
                        </TableCell>
                        <TableCell>
                          {row.company_name}
                          <br />
                          {row.branch_name}
                        </TableCell>
                        <TableCell align={'right'}>{row.count}</TableCell>
                        <TableCell>
                          {PaymentType.SALAEY_DEDUCTIONS === row.payment_type
                            ? '会社清算'
                            : PaymentType.CREDITCARD === row.payment_type
                              ? 'クレジットカード'
                              : 'PayPay'}
                        </TableCell>
                        <TableCell>{OrderStatus.VALID === row.order_status ? '有効' : 'キャンセル'}</TableCell>
                      </TableRow>
                    ))
                  }
                />
                <OrderInfoModal
                  open={open}
                  setOpen={setOpen}
                  searchedDate={new Date()}
                  cancelHandler={orderCancelHandler}
                  openUserDetailHandler={openUserDetailHandler}
                  openCompanyDetailHandler={openCompanyDetailHandler}
                  data={dataDetail}
                  isFetching={isFetchingDetail}
                />
              </>
            )}
          </form>
        </Box>
      </Paper>
    </>
  );
};
