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
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement } from 'react-hook-form-mui';

import { AlertType, UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiResponse } from '@/app/_types/types';
import ItemBase from '@/app/_ui/_shared/itemBase';
import ConfirmDialog from '@/app/_ui/dirty/conformDialog';
import { useDirty } from '@/app/_ui/dirty/dartyContext';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { UserDataDetailResult, UserDetailFormValues, UserDetailSchema } from './_lib/types';

/** ページ名 */
const pageName = 'ユーザー詳細';

type props = {
  data: UserDataDetailResult | null;
};

/**
 * ユーザー詳細Component
 * @returns {JSX.Element} JSX
 */
export const UserDetailComponent = (props: props): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const initdata = props.data;

  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  const { setDirty } = useDirty();

  /* useState
  ------------------------------------------------------------------ */
  // TODO:ユーザー情報のユーザーステータスに差し替えする。
  const [userUsageStatus, setUserUsageStatus] = useState<UserRegistrationStatus>(
    UserRegistrationStatus.WAITING_EMAIL_VERIFICATION
  );
  const [showNini, setShowNini] = useState<boolean>(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ステータス変更確認ダイアログ
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [userData, setUserData] = useState<UserDataDetailResult | undefined>();
  const [dialogActionHandler, setDialogActionHandler] = useState<() => void>(() => {
    return () => {};
  });

  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UserDetailFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(UserDetailSchema),
    defaultValues: {
      usage_status: UsageStatus.DEACTIVATION,
      memo: '',
    },
  });

  /* useEffect
------------------------------------------------------------------ */
  useEffect(() => {
    if (!initdata) {
      openSnackbar(AlertType.ERROR, '店舗情報の取得に失敗しました。再度お試しください。');
      router.push('/user');
      return;
    }
    openProcessing();
    setUserData(initdata);
    reset({
      usage_status: initdata.usage_status as UsageStatus,
      memo: initdata.master_memo,
    });
    setDataLoaded(true);
    closeProcessing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setUserUsageStatus(UserRegistrationStatus.DISAPPROVAL);
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
        setUserUsageStatus(UserRegistrationStatus.WAITING_APPROVAL);
        openSnackbar(AlertType.INFO, 'ユーザー情報を承認しました。');
      }, 3000);
    };
    // dialog setting
    setDialogMessage(`ユーザー情報を"承認"します。\n変更後、引き戻しはできませんがよろしいですか？`);
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
        setUserUsageStatus(UserRegistrationStatus.WAITING_EMAIL_VERIFICATION);
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
    setUserUsageStatus(UserRegistrationStatus.WAITING_APPROVAL);
  };
  // 申請中ステータス
  const modeChangeHandler_PENDING = () => {
    setUserUsageStatus(UserRegistrationStatus.WAITING_EMAIL_VERIFICATION);
  };
  // 否認ステータス
  const modeChangeHandler_DISAPPROVAL = () => {
    setUserUsageStatus(UserRegistrationStatus.DISAPPROVAL);
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
          <Typography>{'モック用 '}</Typography>
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
          </ButtonGroup>
          {/* モック用部品 */}
        </Grid>
        <Divider />
        <Box sx={{ m: 3 }}>
          {dataLoaded && (
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
                    value={userData?.id}
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
                    value={userData?.user_name}
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
                    value={userData?.user_name_kana}
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
                    value={userData?.user_email}
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
                    value={userData?.t_companies?.company_name}
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
                    value={userData?.t_companies?.branch_name}
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
                    value={userData?.t_companies_department?.department_name}
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
                    value={userData?.t_companies_employment_status?.employment_status_name}
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
                    value={userUsageStatus}
                  />
                </ItemBase>
                {userUsageStatus === UserRegistrationStatus.WAITING_APPROVAL && (
                  <>
                    <ItemBase name={'利用ステータス'} isRequired={0}>
                      <SelectElement
                        control={control}
                        size="small"
                        name="usage_status"
                        fullWidth
                        options={[
                          { id: UsageStatus.AVAILABLE, label: '利用可能' },
                          { id: UsageStatus.DEACTIVATION, label: '利用停止' },
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
                {userUsageStatus === UserRegistrationStatus.WAITING_APPROVAL && (
                  <Button fullWidth variant="contained" type={'submit'}>
                    更新
                  </Button>
                )}
                {/* 否認の場合 */}
                {userUsageStatus === UserRegistrationStatus.DISAPPROVAL && (
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
                  </>
                )}
                {/* 申請中の場合 */}
                {userUsageStatus === UserRegistrationStatus.WAITING_EMAIL_VERIFICATION && (
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
          )}
        </Box>
      </Paper>
    </>
  );
};
