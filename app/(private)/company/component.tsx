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
import { ShopSearchFormValues } from '../shop/_lib/types';
import { CompanyListSearchResult, CompanySearchFormValues, CompanySearchSchema } from './_lib/types';

/* ページ名 */
const pageName = '会社一覧';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: '会社名', variableName: 'company_name', sort: SortType.ASC },
  { name: '支店名', variableName: 'branch_name', sort: SortType.ASC },
  { name: '住所', variableName: 'address', sort: SortType.ASC },
  { name: '利用ステータス', variableName: 'usage_status', sort: SortType.ASC },
];

const initConditionValues: ApiRequest<CompanySearchFormValues> = {
  request: {
    company_name: '',
    branch_name: '',
    prefectures: '',
    municipalities: '',
    town_area: '',
    usage_status: undefined,
  },
  sortItems: {
    nextPage: 1,
    sortColumn: 'company_name',
    ascending: true,
  },
};

/**
 * 会社一覧Component
 * @returns {JSX.Element} JSX
 */
export const CompanyComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  /* ソート配列 */
  const [sortArray, setSortArray] = useState<HeaderStatus[]>(resultHeader);
  /* 現在のソート対象項目 */
  const [sortTarget, setSortTarget] = useState<HeaderStatus>(resultHeader[0]);
  /* 現在の検索種別 */
  const [searchType, setSearchType] = useState<SearchType>(SearchType.SEARCH);

  /* 検索結果 */
  const [isSearch, setIsSearch] = useState(false);
  const [condition, setCondition] = useState<ApiRequest<CompanySearchFormValues> | null>(null);
  /* 検索結果 */
  const [result, setResult] = useState<ApiResponse<CompanyListSearchResult[]> | null>(null);

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, reset, control, getValues, setValue } = useForm<CompanySearchFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(CompanySearchSchema),
    defaultValues: {
      company_name: '',
      branch_name: '',
      prefectures: '',
      municipalities: '',
      town_area: '',
      usage_status: undefined,
    },
  });

  /* useQuery
 ------------------------------------------------------------------ */
  const fetchData = async () => {
    const response = await fetch('/api/company/search', {
      method: 'POST',
      body: JSON.stringify(condition),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res: ApiResponse<CompanyListSearchResult[]> = await response.json();
    return res;
  };

  const { data, isFetching, refetch } = useQuery<ApiResponse<CompanyListSearchResult[]>>({
    queryKey: [QUERY_KEYS.COMPANY_SEARCH_RESULT, condition],
    queryFn: fetchData,
    enabled: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    const searchCondition = sessionStorage.getItem(SESSION_STORAGE_KEYS.COMPANY_SEARCH_CONDITION);
    const searchConditionLocal = localStorage.getItem('保存');
    console.log(searchConditionLocal);
    const previousPath = sessionStorage.getItem(SESSION_STORAGE_KEYS.PREVIOUS_PATH);
    if (searchCondition && previousPath === '/companyDetail') {
      const req: ApiRequest<CompanySearchFormValues> = JSON.parse(searchCondition);
      setCondition(req);
      setValue('company_name', req.request.company_name);
      setValue('branch_name', req.request.usage_status);
      setValue('prefectures', req.request.prefectures);
      setValue('municipalities', req.request.municipalities);
      setValue('town_area', req.request.town_area);
      setValue('usage_status', req.request.usage_status);
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
  /* 検索ハンドラ */
  const searchHandler: SubmitHandler<ShopSearchFormValues> = async (data) => {
    openProcessing();
    const req: ApiRequest<CompanySearchFormValues> = {
      request: data,
      sortItems: {
        nextPage: 1,
        sortColumn: 'company_name',
        ascending: true,
      },
    };
    setSearchType(SearchType.SEARCH);
    setCondition(req);
  };

  /* 並び替えハンドラ */
  const sortHandler = async (sortColumn: string, ascending: boolean) => {
    openProcessing();
    const req: ApiRequest<CompanySearchFormValues> = {
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

  /* ページ送りハンドラ */
  const pageChangeHandler = async (_event: React.ChangeEvent<unknown>, nextPage: number) => {
    openProcessing();
    const req: ApiRequest<CompanySearchFormValues> = {
      request: condition?.request ?? initConditionValues.request,
      sortItems: {
        nextPage: nextPage ?? 0,
        sortColumn: condition?.sortItems?.sortColumn ?? 'company_name',
        ascending: condition?.sortItems?.ascending ?? true,
      },
    };
    setSearchType(SearchType.PAGENATION);
    setCondition(req);
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    localStorage.setItem('保存', 'あいうえお');
    sessionStorage.setItem(SESSION_STORAGE_KEYS.COMPANY_SEARCH_CONDITION, JSON.stringify(condition));
    router.push(`/companyDetail/${id}`);
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
              <ItemBase name={'支店名'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <TextFieldElement control={control} size="small" color={'primary'} name="branch_name" fullWidth />
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="prefectures" fullWidth />
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
            {/* ======= 検索結果 ========================================== */}
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
                    /* 検索結果 */
                    result.data?.map((row, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{ '&:hover': { cursor: 'pointer' } }}
                        onClick={() => {
                          linkHandler(row.id);
                        }}
                      >
                        <TableCell width={'20%'}>{row.company_name}</TableCell>
                        <TableCell width={'20%'}>{row.branch_name}</TableCell>
                        <TableCell
                          sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                          }}
                          width={'50%'}
                        >
                          〒{row.postal_code}
                          <br />
                          {row.prefectures}
                          {row.municipalities}
                          {row.town_area}
                          {row.area_block_number}
                          {row.building_name}
                        </TableCell>
                        <TableCell width={'10%'}>{row.usage_status}</TableCell>
                      </TableRow>
                    ))
                  }
                />
              </>
            )}
          </form>
        </Box>
      </Paper>
    </>
  );
};
