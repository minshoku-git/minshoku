'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TableCell, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { AlertType, SearchType, SortType, UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { SESSION_STORAGE_KEYS } from '@/app/_types/sessionStorageKeys';
import { ApiRequest, ApiResponse, HeaderStatus } from '@/app/_types/types';
import { CustomTable } from '@/app/_ui/_shared/costomTable/customTable';
import { ResultsCounter } from '@/app/_ui/_shared/resultsCounter';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import ItemBase from '../../_ui/_shared/itemBase';
import { UserDataDetailResult } from '../userDetail/[id]/_lib/types';
import { UserListSearchResult, UserSearchFormValues, UserSearchSchema } from './_lib/types';

/* ページ名 */
const pageName = 'ユーザー一覧';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: 'ユーザー名', variableName: 'user_name', sort: SortType.ASC },
  { name: '会社名', variableName: 'company_name', sort: SortType.ASC },
  { name: '支店名', variableName: 'branch_name', sort: SortType.ASC },
  { name: '利用ステータス', variableName: 'usage_status', sort: SortType.ASC },
  { name: '登録ステータス', variableName: 'user_registration_status', sort: SortType.ASC },
];

const initConditionValues: ApiRequest<UserSearchFormValues> = {
  request: {
    user_name: '',
    company_name: '',
    branch_name: '',
    user_registration_status: undefined,
  },
  sortItems: {
    nextPage: 1,
    sortColumn: 'user_name',
    ascending: true,
  },
};

/**
 * ユーザー一覧Component
 * @returns {JSX.Element} JSX
 */
export const UserComponent = (): JSX.Element => {
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

  /* 検索結果 */
  const [isSearch, setIsSearch] = useState(false);
  /* 検索条件 */
  const [condition, setCondition] = useState<ApiRequest<UserSearchFormValues> | null>(null);
  /* 検索結果 */
  const [result, setResult] = useState<ApiResponse<UserListSearchResult[]> | null>(null);

  /* useForm
  ------------------------------------------------------------------ */
  const { reset, control, handleSubmit, setValue } = useForm<UserSearchFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(UserSearchSchema),
    defaultValues: {
      user_name: '',
      company_name: '',
      branch_name: '',
      user_registration_status: undefined,
    },
  });

  /* useQuery
  ------------------------------------------------------------------ */
  const fetchData = async () => {
    const response = await fetch('/api/user/search', {
      method: 'POST',
      body: JSON.stringify(condition),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res: ApiResponse<UserListSearchResult[]> = await response.json();
    return res;
  };

  const { data, isFetching, refetch } = useQuery<ApiResponse<UserListSearchResult[]>>({
    queryKey: [QUERY_KEYS.USER_SEARCH_RESULT, condition],
    queryFn: fetchData,
    enabled: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    const searchCondition = sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_SEARCH_CONDITION);
    const previousPath = sessionStorage.getItem(SESSION_STORAGE_KEYS.PREVIOUS_PATH);
    console.log(SESSION_STORAGE_KEYS.USER_SEARCH_CONDITION, searchCondition);
    if (searchCondition && previousPath === '/userDetail') {
      const req: ApiRequest<UserSearchFormValues> = JSON.parse(searchCondition);
      setCondition(req);
      setValue('user_name', req.request.user_name);
      setValue('company_name', req.request.company_name);
      setValue('branch_name', req.request.branch_name);
      setValue('usage_status', req.request.usage_status);
      setValue('user_registration_status', req.request.user_registration_status);
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
    if (!data?.success) {
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
  const searchHandler: SubmitHandler<UserSearchFormValues> = async (data) => {
    const req: ApiRequest<UserSearchFormValues> = {
      request: data,
      sortItems: {
        nextPage: 1,
        sortColumn: 'user_name',
        ascending: true,
      },
    };
    setSearchType(SearchType.SEARCH);
    setCondition(req);
  };

  /** ソート */
  const sortHandler = async (sortColumn: string, ascending: boolean) => {
    openProcessing();
    const req: ApiRequest<UserSearchFormValues> = {
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

  // リセットハンドラ
  const onResetClick = () => {
    reset();
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.USER_SEARCH_CONDITION, JSON.stringify(condition));
    router.push(`/userDetail/${id}`);
  };

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
              <ItemBase name={'登録ステータス'} isRequired={2}>
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
                    name="user_registration_status"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: UserRegistrationStatus.WAITING_APPROVAL, label: '承認待ち' },
                      { id: UserRegistrationStatus.DISAPPROVAL, label: '否認' },
                      { id: UserRegistrationStatus.WAITING_EMAIL_VERIFICATION, label: 'メール認証待ち' },
                      { id: UserRegistrationStatus.WAITING_PAYMENT_SETUP, label: '支払方法登録待ち' },
                      { id: UserRegistrationStatus.REGISTERED, label: '登録済み' },
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
            {isSearch && result?.success && (
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
                  pageChangeHandler={() => { }}
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
                        <TableCell sx={{ whiteSpace: 'pre' }}>
                          {row.user_name} / {row.user_name_kana}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'pre' }}>{row.t_companies.company_name}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre' }}>{row.t_companies.branch_name}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre' }}>{row.usage_status}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre' }}>{row.user_registration_status}</TableCell>
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
