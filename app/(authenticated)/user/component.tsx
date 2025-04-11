'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, Switch, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { MockDataCreate_UserResult } from '@/app/_lib/createMockData';
import { SortType } from '@/app/_types/enum';
import { UserSearchFormValues, UserSearchSchema } from '@/app/_types/types';
import OpenProcessing from '@/app/_ui/processing/processing';
import { useProcessing } from '@/app/_ui/processing/processingContext';

import ItemBase from '../../_ui/_shared/itemBase';
import UserResult, { HeaderStatus } from './parts/userResult';

/** ページ名 */
const pageName = 'ユーザー一覧';
const resultHeader: Array<HeaderStatus> = [
  { name: 'ユーザー名', variableName: 'userName', sort: SortType.ASC },
  { name: '会社名', variableName: 'companyName', sort: SortType.ASC },
];

/* TODO: タイプ定義ファイルに移動 */
export type UserSearchResult = {
  id: string;
  userName: string;
  companyName: string;
  status: string;
};

export const UserComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */

  const router = useRouter();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  const [isSearch, setIsSearch] = useState(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { reset, control, handleSubmit } = useForm<UserSearchFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(UserSearchSchema),
    defaultValues: {
      userName: '',
      companyName: '',
      status: '',
    },
  });

  /* functions
  ------------------------------------------------------------------ */

  // 検索ハンドラ
  const searchHandler: SubmitHandler<UserSearchFormValues> = (data) => {
    console.log('data:' + data);
    setIsSearch(!isSearch);
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

  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  // MOCKDATA
  const result = MockDataCreate_UserResult();

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {/* <OpenProcessing /> */}
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
                      { id: '00', label: '制限なし' },
                      { id: '01', label: '申請中' },
                      { id: '02', label: '利用停止' },
                      { id: '03', label: '否認' },
                      { id: '04', label: '削除' },
                      { id: '05', label: '登録中' },
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
                <UserResult
                  header={resultHeader}
                  result={result}
                  linkHandler={linkHandler}
                  openProcessing={openProcessing}
                  closeProcessing={closeProcessing}
                />
              </>
            )}
          </form>
        </Box>
      </Paper>
    </>
  );
};
