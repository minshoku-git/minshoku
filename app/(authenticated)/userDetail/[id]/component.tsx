'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, FormControlLabel, Paper, Switch, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useParams } from 'next/navigation';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { UserDetailFormValues, UserDetailSchema } from '@/app/_types/types';
import { HYPHEN } from '@/app/_types/values';
import ItemBase from '@/app/_ui/_shared/itemBase';
import { useDirty } from '@/app/_ui/dirty/dartyContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

/** ページ名 */
const pageName = 'ユーザー詳細';

export const UserDetailComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const params = useParams();

  const { openSnackbar } = useSnackBar();
  const { setDirty } = useDirty();

  /* useState
  ------------------------------------------------------------------ */
  const [approvalMode, setApprovalMode] = useState<boolean>(HYPHEN() !== params.id);

  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<UserDetailFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(UserDetailSchema),
    defaultValues: {
      restriction: '10',
      memo: '',
    },
  });

  /* functions
  ------------------------------------------------------------------ */
  /* 更新 */
  const submitHandler: SubmitHandler<UserDetailFormValues> = (data) => {
    openSnackbar(AlertType.INFO, 'ユーザー情報を更新しました。');
  };

  /* 承認 */
  const approvalHandler = () => {
    setApprovalMode(false);
    openSnackbar(AlertType.INFO, 'ユーザー情報を承認しました。');
  };

  /* dirty
  ------------------------------------------------------------------ */
  useEffect(() => {
    setDirty(isDirty);
  }, [isDirty, setDirty]);

  useEffect(() => {
    return () => {
      setDirty(false); // CleanUp
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  // モード切り替え
  const modeChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setApprovalMode(e.target.checked);
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
          <Box sx={{ flexGrow: 1 }} />
          <FormControlLabel
            value="end"
            control={
              <Switch
                color="primary"
                onChange={(e) => {
                  modeChangeHandler(e);
                }}
                checked={approvalMode}
              />
            }
            label="ApprovalMode"
            labelPlacement="end"
          />
        </Grid>
        <Divider />
        <Box sx={{ m: 3 }}>
          <form onSubmit={handleSubmit(submitHandler)}>
            <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} direction="column">
              <ItemBase name={'ユーザーID'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopId"
                  fullWidth
                  disabled
                  sx={{ backgroundColor: 'lightgray' }}
                  value={'ユーザーID'}
                />
              </ItemBase>
              <ItemBase name={'ユーザー名'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'ユーザー名'}
                />
              </ItemBase>
              <ItemBase name={'ユーザー名(カナ)'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'ユーザー名(カナ)'}
                />
              </ItemBase>
              <ItemBase name={'メールアドレス'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'xxxxxxxx@refact.co.jp'}
                />
              </ItemBase>
              <ItemBase name={'会社名'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'株式会社リファクト'}
                />
              </ItemBase>
              <ItemBase name={'部署名'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'第一システム開発本部'}
                />
              </ItemBase>
              <ItemBase name={'雇用形態名'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'正社員'}
                />
              </ItemBase>
              <ItemBase name={'任意項目1'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'任意項目1'}
                />
              </ItemBase>
              <ItemBase name={'任意項目2'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'任意項目2'}
                />
              </ItemBase>
              <ItemBase name={'ステータス'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'登録中'}
                />
              </ItemBase>
              <ItemBase name={'利用制限'} isRequired={0}>
                <SelectElement
                  control={control}
                  size="small"
                  name="restriction"
                  fullWidth
                  options={[
                    { id: '', label: '未選択' },
                    { id: '10', label: '利用可能' },
                    { id: '20', label: '利用停止' },
                  ]}
                ></SelectElement>
              </ItemBase>
              <ItemBase name={'メモ'} isRequired={1}>
                <TextareaAutosizeElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="memo"
                  minRows={3}
                  resizeStyle="vertical"
                  placeholder="500文字以内で入力してください。"
                  fullWidth
                />
              </ItemBase>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', mt: 2, gap: 2 }}>
              <Button fullWidth variant="contained" type={'submit'}>
                更新
              </Button>
              {approvalMode && (
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  onClick={() => {
                    approvalHandler();
                  }}
                >
                  承認
                </Button>
              )}
            </Grid>
          </form>
        </Box>
      </Paper>
    </>
  );
};
