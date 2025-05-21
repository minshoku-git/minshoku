'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  FormControlLabel,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement } from 'react-hook-form-mui';

import { AlertType, UserUsageStatus } from '@/app/_types/enum';
import { UserDetailFormValues, UserDetailSchema } from '@/app/_types/types';
import ItemBase from '@/app/_ui/_shared/itemBase';
import ConfirmDialog from '@/app/_ui/dirty/conformDialog';
import { useDirty } from '@/app/_ui/dirty/dartyContext';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

/** ページ名 */
const pageName = 'ユーザー詳細';

/**
 * ユーザー詳細Component
 * @returns {JSX.Element} JSX
 */
export const UserDetailComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const params = useParams();
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  const { setDirty } = useDirty();

  /* useState
  ------------------------------------------------------------------ */
  // TODO:ユーザー情報のユーザーステータスに差し替えする。
  const [userUsageStatus, setUserUsageStatus] = useState<UserUsageStatus>(UserUsageStatus.PENDING);
  const [showNini, setShowNini] = useState<boolean>(true);

  // ステータス変更確認ダイアログ
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [dialogActionHandler, setDialogActionHandler] = useState<() => void>(() => {
    return () => {};
  });

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
  /** 更新 */
  const submitHandler: SubmitHandler<UserDetailFormValues> = (data) => {
    openSnackbar(AlertType.INFO, 'ユーザー情報を更新しました。');
  };

  /** 否認 */
  const disapprovalHandler = () => {
    const handler = () => {
      openProcessing();
      // TODO:否認APIの呼出し
      setTimeout(() => {
        closeProcessing();
        setUserUsageStatus(UserUsageStatus.DISAPPROVAL);
        openSnackbar(AlertType.INFO, 'ユーザー情報を否認しました。');
      }, 3000);
    };
    // dialog setting
    setDialogMessage(`ユーザー情報を"否認"します。\nよろしいですか？`);
    setDialogActionHandler(() => handler);
    setOpenDialog(true);
  };

  /** 承認 */
  const approvalHandler = () => {
    const handler = () => {
      openProcessing();
      // TODO:承認APIの呼出し
      setTimeout(() => {
        closeProcessing();
        setUserUsageStatus(UserUsageStatus.NOLIMIT);
        openSnackbar(AlertType.INFO, 'ユーザー情報を承認しました。');
      }, 3000);
    };
    // dialog setting
    setDialogMessage(`ユーザー情報を"承認"します。\n変更後、引き戻しはできませんがよろしいですか？`);
    setDialogActionHandler(() => handler);
    setOpenDialog(true);
  };

  /** 削除 */
  const deletelHandler = () => {
    const handler = () => {
      openProcessing();
      // TODO:削除APIの呼出し
      setTimeout(() => {
        closeProcessing();
        setUserUsageStatus(UserUsageStatus.DELETE);
        openSnackbar(AlertType.INFO, 'ユーザー情報を削除しました。');
      }, 3000);
    };
    // dialog setting
    setDialogMessage(`ユーザー情報を"削除"します。\n変更後、引き戻しはできませんがよろしいですか？`);
    setDialogActionHandler(() => handler);
    setOpenDialog(true);
  };

  /** 引き戻し */
  const pullBackHandler = () => {
    const handler = () => {
      openProcessing();
      // TODO:引き戻しAPIの呼出し
      setTimeout(() => {
        closeProcessing();
        setUserUsageStatus(UserUsageStatus.PENDING);
        openSnackbar(AlertType.INFO, 'ユーザー情報を引き戻しました。');
      }, 3000);
    };
    // dialog setting
    setDialogMessage(`ユーザー情報のステータスを"否認"から"申請中"に引き戻します。\nよろしいですか？`);
    setDialogActionHandler(() => handler);
    setOpenDialog(true);
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
  // 制限なしステータス
  const modeChangeHandler_NOLIMIT = () => {
    setUserUsageStatus(UserUsageStatus.NOLIMIT);
  };
  // 申請中ステータス
  const modeChangeHandler_PENDING = () => {
    setUserUsageStatus(UserUsageStatus.PENDING);
  };
  // 否認ステータス
  const modeChangeHandler_DISAPPROVAL = () => {
    setUserUsageStatus(UserUsageStatus.DISAPPROVAL);
  };
  // 削除ステータス
  const modeChangeHandler_DELETE = () => {
    setUserUsageStatus(UserUsageStatus.DELETE);
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {/* ステータス変更確認ダイアログ */}
      <ConfirmDialog
        open={openDialog}
        routerPush={dialogActionHandler}
        closeConform={() => setOpenDialog(false)}
        title={'ステータス変更確認'}
        message={dialogMessage}
      />
      {/* MainContents */}
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
          {/* モック用部品 */}
          <Typography>{'モック用　'}</Typography>
          <FormControlLabel
            value="end"
            control={
              <Switch
                color="primary"
                onChange={(e) => {
                  setShowNini(!showNini);
                }}
                checked={showNini}
              />
            }
            label="任意項目表示"
            labelPlacement="end"
          />
          <ButtonGroup sx={{ mr: 3 }}>
            <Button onClick={() => modeChangeHandler_NOLIMIT()}>制限なしステータス</Button>
            <Button onClick={() => modeChangeHandler_PENDING()}>申請中ステータス</Button>
            <Button onClick={() => modeChangeHandler_DISAPPROVAL()}>否認ステータス</Button>
            <Button onClick={() => modeChangeHandler_DELETE()}>削除ステータス</Button>
          </ButtonGroup>
          {/* モック用部品 */}
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
              <ItemBase name={'支店名'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={'本郷事業所'}
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
              {showNini && (
                <>
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
                </>
              )}
              <ItemBase name={'ステータス'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="shopName"
                  fullWidth
                  sx={{ backgroundColor: 'lightgray' }}
                  disabled
                  value={
                    UserUsageStatus.NOLIMIT === userUsageStatus
                      ? '制限なし'
                      : UserUsageStatus.PENDING === userUsageStatus
                        ? '申請中'
                        : UserUsageStatus.DEACTIVATION === userUsageStatus
                          ? '利用停止'
                          : UserUsageStatus.DISAPPROVAL === userUsageStatus
                            ? '否認'
                            : UserUsageStatus.DELETE === userUsageStatus
                              ? '削除'
                              : '登録中'
                  }
                />
              </ItemBase>
              {userUsageStatus === UserUsageStatus.NOLIMIT && (
                <>
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
                </>
              )}
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', mt: 2, gap: 2 }}>
              {/* 制限なしの場合 */}
              {userUsageStatus === UserUsageStatus.NOLIMIT && (
                <Button fullWidth variant="contained" type={'submit'}>
                  更新
                </Button>
              )}
              {/* 否認の場合 */}
              {userUsageStatus === UserUsageStatus.DISAPPROVAL && (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      pullBackHandler();
                    }}
                  >
                    引き戻し
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={() => {
                      deletelHandler();
                    }}
                  >
                    削除
                  </Button>
                </>
              )}
              {/* 申請中の場合 */}
              {userUsageStatus === UserUsageStatus.PENDING && (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={() => {
                      disapprovalHandler();
                    }}
                  >
                    否認
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={() => {
                      approvalHandler();
                    }}
                  >
                    承認
                  </Button>
                </>
              )}
            </Grid>
          </form>
        </Box>
      </Paper>
    </>
  );
};
