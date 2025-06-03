'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TableCell, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { MockDataCreate_OrderResult } from '@/app/_lib/createMockData';
import { getLastMonthEndDay, getLastMonthStartDay, getNow, getTomorrow, getYesterday } from '@/app/_lib/getDateTime';
import { AlertType, OrderStatus, PaymentTypes, SortType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, HeaderStatus } from '@/app/_types/types';
import { CustomTable } from '@/app/_ui/_shared/costomTable/customTable';
import { ResultsCounter } from '@/app/_ui/_shared/resultsCounter';
import ConfirmDialog from '@/app/_ui/dirty/conformDialog';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import ItemBase from '../../_ui/_shared/itemBase';
import { OrderListSearchResult, OrderSearchFormValues, OrderSearchSchema } from './_lib/types';
import OrderInfoModal from './orderInfoModal';

/* ページ名 */
const pageName = 'オーダー一覧';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: '配達日', variableName: 'delivery_day', sort: SortType.ASC },
  { name: 'ユーザー名', variableName: 'user_name', sort: SortType.ASC },
  { name: '会社名 / 支店名', variableName: 'company_name', sort: SortType.ASC },
  { name: '食数', variableName: 'count', sort: SortType.ASC },
  { name: '決済方法', variableName: 'payment_state', sort: SortType.ASC },
  { name: '注文ステータス', variableName: 'order_state', sort: SortType.ASC },
];

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

  // TODO:オーダー情報のオーダーステータスに差し替えする。
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.VALID);

  // ステータス変更確認ダイアログ
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogActionHandler, setDialogActionHandler] = useState<() => void>(() => {
    return () => {};
  });

  /* useState
  ------------------------------------------------------------------ */
  // ソート配列
  const [sortArray, setSortArray] = useState<HeaderStatus[]>(resultHeader);
  // 現在のソート対象項目
  const [sortTarget, setSortTarget] = useState<HeaderStatus>(resultHeader[0]);

  // 検索状態
  const [isSearch, setIsSearch] = useState(false);
  /* 検索条件 */
  const [condition, setCondition] = useState<ApiRequest<OrderSearchFormValues>>({
    request: {
      deliveryFrom: null,
      deliveryTo: null,
      branchName: '',
      companyName: '',
      status: '0',
      userName: '',
    },
    sortItems: {
      nextPage: 1,
      sortColumn: 'company_name',
      ascending: true,
    },
  });
  /* 検索結果 */
  const [result, setResult] = useState<ApiResponse<OrderListSearchResult[]> | null>({
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
  // モーダル
  const [open, setOpen] = React.useState(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { reset, control, setValue, handleSubmit } = useForm<OrderSearchFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(OrderSearchSchema),
    defaultValues: {
      deliveryFrom: getNow(),
      deliveryTo: getNow(),
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

  /** 検索ハンドラ */
  const searchHandler: SubmitHandler<OrderSearchFormValues> = (data) => {
    openProcessing();
    const req: ApiRequest<OrderSearchFormValues> = {
      request: data,
      sortItems: {
        nextPage: 1,
        sortColumn: 'delivery_day',
        ascending: true,
      },
    };
    // const res = await searchOrderList(req);
    // todo: 差し替え
    const res: ApiResponse<OrderListSearchResult[]> = {
      error: '',
      data: MockDataCreate_OrderResult(),
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

  /* 並び替えハンドラ */
  const sortHandler = async (sortColumn: string, ascending: boolean) => {
    openProcessing();
    const req: ApiRequest<OrderSearchFormValues> = {
      request: condition.request,
      sortItems: {
        nextPage: 1,
        sortColumn: sortColumn,
        ascending: ascending,
      },
    };

    // const res = await searchOrderList(req);
    // todo: 差し替え
    const res: ApiResponse<OrderListSearchResult[]> = {
      error: '',
      data: MockDataCreate_OrderResult(),
      paginate: { count: 30, currentPage: 1, endRow: 30, startRow: 1, totalPage: 1 },
    };

    if (res.error) {
      openSnackbar(AlertType.ERROR, '検索時にエラーが発生しました。再度発生する場合は、管理者にお問い合わせください。');
      setResult(null);
      setIsSearch(false);
    } else {
      setSortArray(resultHeader);
      setSortTarget(resultHeader[0]);
      setCondition(req);
      setResult(res);
      setIsSearch(true);
    }
    closeProcessing();
  };

  /* ページ送りハンドラ */
  const pageChangeHandler = async (_event: React.ChangeEvent<unknown>, nextPage: number) => {
    openProcessing();
    const req: ApiRequest<OrderSearchFormValues> = {
      request: condition.request,
      sortItems: {
        nextPage: nextPage ?? 0,
        sortColumn: condition.sortItems?.sortColumn ?? 'delivery_day',
        ascending: condition.sortItems?.ascending ?? true,
      },
    };

    // const res = await searchOrderList(req);
    // todo: 差し替え
    const res: ApiResponse<OrderListSearchResult[]> = {
      error: '',
      data: MockDataCreate_OrderResult(),
      paginate: { count: 30, currentPage: 1, endRow: 30, startRow: 1, totalPage: 1 },
    };

    if (res.error) {
      openSnackbar(AlertType.ERROR, '検索時にエラーが発生しました。再度発生する場合は、管理者にお問い合わせください。');
      setResult(null);
      setIsSearch(false);
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      setResult(res);
      setIsSearch(true);
    }
    closeProcessing();
  };

  /** モーダル制御 */
  // TODO 値渡す
  const openModal = () => {
    console.log('click');
    setOpen(true);
  };

  /** キャンセルハンドラ */
  const cancelHandler = () => {
    const handler = () => {
      openProcessing();
      // TODO:キャンセルAPIの呼出し
      setTimeout(() => {
        closeProcessing();
        setOrderStatus(OrderStatus.CANCEL);
        openSnackbar(AlertType.INFO, 'キャンセルが完了しました。');
      }, 3000);
    };
    // dialog setting
    setDialogActionHandler(() => handler);
    setOpenDialog(true);
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

  /* JSX
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="userName" fullWidth />
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="companyName" fullWidth />
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
                    name="status"
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
            {isSearch && result && (
              <>
                <Divider sx={{ my: 3 }} />
                {result.paginate?.count && result.paginate?.count > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'end' }}>
                    <ResultsCounter
                      startRow={result.paginate?.startRow}
                      endRow={result.paginate?.endRow}
                      count={result.paginate?.count}
                    />
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
                      <TableRow key={index} hover sx={{ '&:hover': { cursor: 'pointer' } }} onClick={openModal}>
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
                          {PaymentTypes.SALAEY_DEDUCTIONS === row.payment_state
                            ? '会社清算'
                            : PaymentTypes.CREDITCARD === row.payment_state
                              ? 'クレジットカード'
                              : 'PayPay'}
                        </TableCell>
                        <TableCell>{OrderStatus.CANCEL === row.order_state ? 'キャンセル' : '有効'}</TableCell>
                      </TableRow>
                    ))
                  }
                />
                <OrderInfoModal
                  open={open}
                  setOpen={setOpen}
                  searchedDate={new Date()}
                  orderStatus={orderStatus}
                  cancelHandler={cancelHandler}
                />
              </>
            )}
          </form>
        </Box>
      </Paper>
    </>
  );
};
