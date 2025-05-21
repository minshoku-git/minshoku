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
  { name: 'ステータス', variableName: 'usage_state', sort: SortType.ASC },
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
  /* 検索結果 */
  const [isSearch, setIsSearch] = useState(false);
  /* 検索条件 */
  const [condition, setCondition] = useState<ApiRequest<UserSearchFormValues>>({
    request: {
      user_name: '',
      company_name: '',
      branch_name: '',
      usage_state: '',
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
      usage_state: '',
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
      console.log(res);
      setCondition(req);
      setResult(res);
      setIsSearch(true);
    }
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
                    name="usage_state"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: '0', label: '制限なし' },
                      { id: '1', label: '申請中' },
                      { id: '2', label: '利用停止' },
                      { id: '3', label: '否認' },
                      { id: '4', label: '削除' },
                      { id: '5', label: '登録中' },
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
                {result.paginate?.count && result.paginate?.count > 0 && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'end' }}>
                      {/* 検索件数 */}
                      <ResultsCounter startRow={result.paginate?.startRow} endRow={result.paginate?.endRow} count={result.paginate?.count} />
                    </Box>
                  </>
                )}
                <CustomTable
                  paginate={result.paginate}
                  header={resultHeader}
                  sortHandler={sortHandler}
                  pageChangeHandler={() => { }}
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
                          {UserUsageStatus.NOLIMIT === row.usage_state.toString()
                            ? '制限なし'
                            : UserUsageStatus.PENDING === row.usage_state.toString()
                              ? '申請中'
                              : UserUsageStatus.DEACTIVATION === row.usage_state.toString()
                                ? '利用停止'
                                : UserUsageStatus.DISAPPROVAL === row.usage_state.toString()
                                  ? '否認'
                                  : UserUsageStatus.DELETE === row.usage_state.toString()
                                    ? '削除'
                                    : '登録中'}
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
