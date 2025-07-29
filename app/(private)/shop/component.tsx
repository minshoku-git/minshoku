'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TableCell, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { AlertType, SearchType, SortType, UsageStatus } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { SESSION_STORAGE_KEYS } from '@/app/_types/sessionStorageKeys';
import { ApiRequest, ApiResponse, HeaderStatus } from '@/app/_types/types';
import { CustomTable } from '@/app/_ui/_shared/costomTable/customTable';
import { ResultsCounter } from '@/app/_ui/_shared/resultsCounter';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { state as stateMockData } from '../../../public/state.json';
import ItemBase from '../../_ui/_shared/itemBase';
import { ShopListSearchResult, ShopSearchFormValues, ShopSearchSchema } from './_lib/types';

/** ページ名 */
const pageName = '店舗一覧';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: '店舗名', variableName: 'shop_name', sort: SortType.ASC },
  { name: '住所', variableName: 'address', sort: SortType.ASC },
  { name: '利用ステータス', variableName: 'usage_status', sort: SortType.ASC },
];

const initConditionValues: ApiRequest<ShopSearchFormValues> = {
  request: {
    shop_name: '',
    address: '',
    usage_status: '',
  },
  sortItems: {
    nextPage: 1,
    sortColumn: 'shop_name',
    ascending: true,
  },
};

/**
 * 店舗一覧Component
 * @returns {JSX.Element} JSX
 */
export const ShopComponent = (): JSX.Element => {
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

  const [isSearch, setIsSearch] = useState(false);
  const [condition, setCondition] = useState<ApiRequest<ShopSearchFormValues> | null>(null);

  const [result, setResult] = useState<ApiResponse<ShopListSearchResult[]> | null>(null);

  /* useForm
  ------------------------------------------------------------------ */
  const { control, handleSubmit, reset, setValue } = useForm<ShopSearchFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(ShopSearchSchema),
    defaultValues: {
      shop_name: '',
      address: '',
      usage_status: '',
    },
  });

  /* useQuery
  ------------------------------------------------------------------ */
  const fetchData = async () => {
    const response = await fetch('/api/shop/search', {
      method: 'POST',
      body: JSON.stringify(condition),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res: ApiResponse<ShopListSearchResult[]> = await response.json();
    return res;
  };

  const { data, isFetching, refetch } = useQuery<ApiResponse<ShopListSearchResult[]>>({
    queryKey: [QUERY_KEYS.SHOP_SEARCH_RESULT, condition],
    queryFn: fetchData,
    enabled: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    const searchCondition = sessionStorage.getItem(SESSION_STORAGE_KEYS.SHOP_SEARCH_CONDITION);
    const previousPath = sessionStorage.getItem(SESSION_STORAGE_KEYS.PREVIOUS_PATH);
    console.log(SESSION_STORAGE_KEYS.SHOP_SEARCH_CONDITION, searchCondition);
    if (searchCondition && previousPath === '/shopDetail') {
      const req: ApiRequest<ShopSearchFormValues> = JSON.parse(searchCondition);
      setCondition(req);
      setValue('shop_name', req.request.shop_name);
      setValue('usage_status', req.request.usage_status);
      setValue('address', req.request.address);
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
    if (data?.error) {
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
  const searchHandler: SubmitHandler<ShopSearchFormValues> = async (data) => {
    const req: ApiRequest<ShopSearchFormValues> = {
      request: data,
      sortItems: {
        nextPage: 1,
        sortColumn: 'shop_name',
        ascending: true,
      },
    };
    setSearchType(SearchType.SEARCH);
    setCondition(req);
  };

  /** ソート */
  const sortHandler = async (sortColumn: string, ascending: boolean) => {
    openProcessing();
    const req: ApiRequest<ShopSearchFormValues> = {
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
    const req: ApiRequest<ShopSearchFormValues> = {
      request: condition?.request ?? initConditionValues.request,
      sortItems: {
        nextPage: nextPage ?? 0,
        sortColumn: condition?.sortItems?.sortColumn ?? 'shop_name',
        ascending: condition?.sortItems?.ascending ?? true,
      },
    };
    setSearchType(SearchType.PAGENATION);
    setCondition(req);
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.SHOP_SEARCH_CONDITION, JSON.stringify(condition));
    router.push(`/shopDetail/${id}`);
  };

  // リセット
  const onResetClick = () => {
    reset();
  };

  /* mockData ※のちすて
  ------------------------------------------------------------------ */
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="shop_name" fullWidth />
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="address" fullWidth />
                </Box>
              </ItemBase>
              <ItemBase name={'利用ステータス'} isRequired={2}>
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
                    name="usage_status"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: UsageStatus.AVAILABLE, label: '利用可能' },
                      { id: UsageStatus.DEACTIVATION, label: '利用停止' },
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
            {!isFetching && (
              <>
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
                        result.data?.map((row, index) => (
                          <TableRow
                            key={index}
                            hover
                            sx={{ '&:hover': { cursor: 'pointer' } }}
                            onClick={() => {
                              linkHandler(row.id);
                            }}
                          >
                            <TableCell sx={{ whiteSpace: 'pre' }} width={'20%'}>
                              {row.shop_name}
                            </TableCell>
                            <TableCell
                              width={'50%'}
                              sx={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                overflowWrap: 'break-word',
                              }}
                            >
                              〒{row.shop_postal_code}
                              <br />
                              {row.address}
                            </TableCell>
                            <TableCell width={'10%'}>{row.usage_status}</TableCell>
                          </TableRow>
                        ))
                      }
                    />
                  </>
                )}
              </>
            )}
          </form>
        </Box>
      </Paper>
    </>
  );
};
