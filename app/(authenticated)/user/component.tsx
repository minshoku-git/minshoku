'use client';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FormContainer, SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { MockDataCreate_UserResult } from '@/app/_lib/createMockData';
import { SortType } from '@/app/_types/enum';

import ItemBase from '../../_ui/shared/ItemBase';
import UserResult, { HeaderStatus } from './parts/userResult';

/** ページ名 */
const pageName = 'ユーザー一覧';
const resultHeader: Array<HeaderStatus> = [
  { name: 'ユーザー名', variableName: 'userName', sort: SortType.ASC },
  { name: '会社名', variableName: 'companyName', sort: SortType.ASC },
  { name: 'id', variableName: 'id', sort: SortType.ASC },
];

/* TODO: タイプ定義ファイルに移動 */
export type UserSearchFormValues = {
  userName: string;
  companyName: string;
  status: number;
};

/* TODO: タイプ定義ファイルに移動 */
export type UserSearchResult = {
  id: string;
  userName: string;
  companyName: string;
  status: string;
};

export const UserComponent = () => {
  const router = useRouter();
  const [isSearch, setIsSearch] = useState(false);

  const { reset, control } = useForm<UserSearchFormValues>({
    defaultValues: {
      userName: '',
      companyName: '',
      status: 1,
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // MOCKDATA
  const result = MockDataCreate_UserResult();

  // 検索ハンドラ
  const searchHandler: SubmitHandler<UserSearchFormValues> = (data) => {
    // chipを表示しよう
    // openSnackbar(
    //   AlertType.INFO,
    //   `検索ボタンが押されました...
    //    名：${data.firstName}, 姓：${data.lastName}, 予約日:${data.date}`
    // );
    console.log('addHandler click!!');
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    router.push('/userDetail');
    reset();
  };

  // リセット
  const onResetClick = () => {
    reset();
  };

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
          <FormContainer onSuccess={searchHandler}>
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="userName" fullWidth />
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="companyName" fullWidth />
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
                    name="status"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: '10', label: '利用可能' },
                      { id: '20', label: '利用停止' },
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
                  px: 1,
                  whiteSpace: 'nowrap',
                  textDecoration: 'underline',
                }}
              >
                検索項目をリセット
              </Button>
            </Grid>
            <Grid sx={{ mt: 1 }} size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setIsSearch(!isSearch);
                }}
              >
                検索
              </Button>
            </Grid>
            {isSearch && result && (
              <>
                <Divider sx={{ my: 3 }} />
                <UserResult header={resultHeader} result={result} linkHandler={linkHandler} />
              </>
            )}
          </FormContainer>
        </Box>
      </Paper>
    </>
  );
};
