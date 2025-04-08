'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useCallback, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { DirtyProvider, useDirty } from '@/app/_ui/DartyContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { UserDetailFormValues, UserDetailSchema } from '../../_types/types';
import ItemBase from '../../_ui/shared/ItemBase';

/** ページ名 */
const pageName = 'ユーザー詳細';

export type Props = {
  test: string;
  clearHandler: () => void;
};

export const UserDetailComponent = () => {
  const { openSnackbar } = useSnackBar();
  const { setDirty, isDirty: dirty } = useDirty();

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<UserDetailFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(UserDetailSchema),
    defaultValues: {
      restriction: '10',
      memo: '',
    },
  });
  const submitHandler: SubmitHandler<UserDetailFormValues> = (data) => {
    openSnackbar(AlertType.INFO, 'ユーザー情報を更新しました。');
  };

  console.log('isDirty:' + isDirty);
  console.log('dirty:' + dirty);

  const handleClick = useCallback(() => {
    setDirty(isDirty);
  }, [setDirty, isDirty]);
  // 離脱確認ダイアログ表示
  useEffect(() => {
    console.log('エフェクトのisDirty:' + isDirty);
    handleClick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

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
              <ItemBase name={'雇用形態'} isRequired={2}>
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
              <Button fullWidth variant="contained" color="error" type={'submit'} disabled>
                承認
              </Button>
            </Grid>
          </form>
        </Box>
      </Paper>
    </>
  );
};
