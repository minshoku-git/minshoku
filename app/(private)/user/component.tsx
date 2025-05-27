'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TableCell, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { searchUserList } from '@/app/_actions/actions';
import { ApiRequest, ApiResponse, SearchResult_UserList } from '@/app/_lib/supabase/types';
import { AlertType, SortType, UserUsageStatus } from '@/app/_types/enum';
import { HeaderStatus, UserSearchFormValues, UserSearchSchema } from '@/app/_types/types';
import { CustomTable } from '@/app/_ui/_shared/costomTable/customTable';
import { ResultsCounter } from '@/app/_ui/_shared/resultsCounter';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import ItemBase from '../../_ui/_shared/itemBase';

/* のちすて */
type Props = {
  todos: Array<string>;
};

/* ページ名 */
const pageName = 'ユーザー一覧';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: 'ユーザー名', variableName: 'user_name', sort: SortType.ASC },
  { name: '会社名', variableName: 'company_name', sort: SortType.ASC },
  { name: '支店名', variableName: 'branch_name', sort: SortType.ASC },
  { name: 'ステータス', variableName: 'user_usage_state', sort: SortType.ASC },
];

/**
 * ユーザー一覧Component
 * @returns {JSX.Element} JSX
 */
export const UserComponent = ({ todos }: Props): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const todosdata = todos;
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  // ソート配列
  const [sortArray, setSortArray] = useState<HeaderStatus[]>(resultHeader);
  // 現在のソート対象項目
  const [sortTarget, setSortTarget] = useState<HeaderStatus>(resultHeader[0]);

  /* 検索結果 */
  const [isSearch, setIsSearch] = useState(false);
  /* 検索条件 */
  const [condition, setCondition] = useState<ApiRequest<UserSearchFormValues>>({
    request: {
      user_name: '',
      company_name: '',
      branch_name: '',
      user_usage_status: undefined,
    },
    sortItems: {
      nextPage: 1,
      sortColumn: 'company_name',
      ascending: true,
    },
  });
  /* 検索結果 */
  const [result, setResult] = useState<ApiResponse<SearchResult_UserList[]> | null>({
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
  const { reset, control, handleSubmit } = useForm<UserSearchFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(UserSearchSchema),
    defaultValues: {
      user_name: '',
      company_name: '',
      branch_name: '',
      user_usage_status: undefined,
    },
  });

  /* functions
  ------------------------------------------------------------------ */

  // 検索ハンドラ
  const searchHandler: SubmitHandler<UserSearchFormValues> = async (data) => {
    openProcessing();
    const req: ApiRequest<UserSearchFormValues> = {
      request: data,
      sortItems: {
        nextPage: 1,
        sortColumn: 'user_name',
        ascending: true,
      },
    };
    const res = await searchUserList(req);
    if (res.error) {
      console.log(res.error);
      openSnackbar(AlertType.ERROR, '検索時にエラーが発生しました。再度発生する場合は、管理者にお問い合わせください。');
      setResult(null);
      setIsSearch(false);
    } else {
      setSortArray(resultHeader)
      setSortTarget(resultHeader[0])
      setCondition(req);
      setResult(res);
      setIsSearch(true);
    }
    console.log('これ見れてます？')
    console.log(resultHeader)
    closeProcessing();
  };

  /* 並び替えハンドラ */
  const sortHandler = async (sortColumn: string, ascending: boolean) => {
    openProcessing();
    const req: ApiRequest<UserSearchFormValues> = {
      request: condition.request,
      sortItems: {
        nextPage: 1,
        sortColumn: sortColumn,
        ascending: ascending,
      },
    };
    const res = await searchUserList(req);
    if (res.error) {
      console.log(res.error);
      openSnackbar(AlertType.ERROR, '検索時にエラーが発生しました。再度発生する場合は、管理者にお問い合わせください。');
      setResult(null);
      setIsSearch(false);
    } else {
      setCondition(req);
      setResult(res);
      setIsSearch(true);
    }
    closeProcessing();
    return true;
  };

  // リセットハンドラ
  const onResetClick = () => {
    reset();
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    router.push(`/userDetail/${id}`);
    reset();
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

              <ItemBase name={'ステータス'} isRequired={2}>
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
                    name="user_usage_status"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: UserUsageStatus.NOLIMIT, label: '制限なし' },
                      { id: UserUsageStatus.PENDING, label: '申請中' },
                      { id: UserUsageStatus.DEACTIVATION, label: '利用停止' },
                      { id: UserUsageStatus.DISAPPROVAL, label: '否認' },
                      { id: UserUsageStatus.DELETE, label: '削除' },
                      { id: UserUsageStatus.REGISTERED, label: '登録中' },
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
                    <ResultsCounter startRow={result.paginate?.startRow} endRow={result.paginate?.endRow} count={result.paginate?.count} />
                  </Box>
                ) : (<></>)}
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
                        <TableCell sx={{ whiteSpace: 'pre' }}>
                          {row.user_usage_status}
                        </TableCell>
                      </TableRow>
                    ))
                  }
                />
              </>)}
          </form>
        </Box>
      </Paper>
    </>
  );
};
