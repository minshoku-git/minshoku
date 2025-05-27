'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TableCell, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { searchShopList } from '@/app/_actions/actions';
import { ApiRequest, ApiResponse, SearchResult_ShopList } from '@/app/_lib/supabase/types';
import { AlertType, SortType, UsageStatus, UserUsageStatus } from '@/app/_types/enum';
import { HeaderStatus, ShopSearchFormValues, ShopSearchSchema } from '@/app/_types/types';
import { CustomTable } from '@/app/_ui/_shared/costomTable/customTable';
import { ResultsCounter } from '@/app/_ui/_shared/resultsCounter';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { state as stateMockData } from '../../../public/state.json';
import ItemBase from '../../_ui/_shared/itemBase';

/** ページ名 */
const pageName = '店舗一覧';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: '店舗名', variableName: 'shop_name', sort: SortType.ASC },
  { name: '住所', variableName: 'address', sort: SortType.ASC },
  { name: '利用ステータス', variableName: 'usage_status', sort: SortType.ASC },
];

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

  /* useState
  ------------------------------------------------------------------ */
  // ソート配列
  const [sortArray, setSortArray] = useState<HeaderStatus[]>(resultHeader);
  // 現在のソート対象項目
  const [sortTarget, setSortTarget] = useState<HeaderStatus>(resultHeader[0]);

  const [isSearch, setIsSearch] = useState(false);
  const [condition, setCondition] = useState<ApiRequest<ShopSearchFormValues>>({
    request: {
      shop_name: '',
      prefectures: '',
      municipalities: '',
      town_area: '',
      usage_status: '',
    },
    sortItems: {
      nextPage: 1,
      sortColumn: 'shop_name',
      ascending: true,
    },
  });
  const [result, setResult] = useState<ApiResponse<SearchResult_ShopList[]> | null>({
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
  const { control, handleSubmit, reset } = useForm<ShopSearchFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(ShopSearchSchema),
    defaultValues: {
      shop_name: '',
      prefectures: '',
      municipalities: '',
      town_area: '',
      usage_status: '',
    },
  });

  /* functions
  ------------------------------------------------------------------ */
  // 検索ハンドラ
  const searchHandler: SubmitHandler<ShopSearchFormValues> = async (data) => {
    openProcessing();
    const req: ApiRequest<ShopSearchFormValues> = {
      request: data,
      sortItems: {
        nextPage: 1,
        sortColumn: 'shop_name',
        ascending: true,
      },
    };
    const res = await searchShopList(req);
    if (res.error) {
      openSnackbar(
        AlertType.ERROR,
        '検索時にエラーが発生しました。再度発生する場合は、管理者にお問い合わせください。' + res.error
      );
      setResult(null);
      setIsSearch(false);
    } else {
      setSortArray(resultHeader)
      setSortTarget(resultHeader[0])
      setCondition(req);
      setResult(res);
      setIsSearch(true);
    }
    closeProcessing();
  };

  /* 並び替えハンドラ */
  const sortHandler = async (sortColumn: string, ascending: boolean) => {
    openProcessing();
    const req: ApiRequest<ShopSearchFormValues> = {
      request: condition.request,
      sortItems: {
        nextPage: 1,
        sortColumn: sortColumn,
        ascending: ascending,
      },
    };
    const res = await searchShopList(req);
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

  /* ページ送りハンドラ */
  const pageChangeHandler = async (_event: React.ChangeEvent<unknown>, nextPage: number) => {
    openProcessing();
    const req: ApiRequest<ShopSearchFormValues> = {
      request: condition.request,
      sortItems: {
        nextPage: nextPage ?? 0,
        sortColumn: condition.sortItems?.sortColumn ?? 'shop_name',
        ascending: condition.sortItems?.ascending ?? true,
      },
    };
    const res = await searchShopList(req);
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

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    router.push(`/shopDetail/${id}`);
    reset();
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
                  <SelectElement
                    control={control}
                    size="small"
                    name="prefectures"
                    label="都道府県"
                    fullWidth
                    options={stateData}
                  ></SelectElement>
                  <SelectElement
                    control={control}
                    size="small"
                    name="municipalities"
                    label="市区"
                    fullWidth
                    options={[
                      { id: '', label: '未選択', value: '未選択' },
                      { id: '10', label: '市区1', value: '市区1' },
                      { id: '20', label: '市区2', value: '市区2' },
                      { id: '30', label: '市区3', value: '市区3' },
                    ]}
                  ></SelectElement>
                  <SelectElement
                    control={control}
                    size="small"
                    name="town_area"
                    label="町村"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: '10', label: '町村1' },
                      { id: '20', label: '町村2' },
                      { id: '30', label: '町村3' },
                    ]}
                  ></SelectElement>
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
            {isSearch && result && (
              <>
                <Divider sx={{ my: 3 }} />
                {result.paginate?.count && result.paginate?.count > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'end' }}>
                    <ResultsCounter
                      startRow={result.paginate?.startRow}
                      endRow={result.paginate?.endRow}
                      count={result.paginate?.count} />
                  </Box>
                ) : (<></>)}
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
                          〒{row.shop_post_code}
                          <br />
                          {row.address}
                        </TableCell>
                        <TableCell width={'10%'}>
                          {row.usage_status}
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
