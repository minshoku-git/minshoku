'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement } from 'react-hook-form-mui';

import { AlertType, convertUserRegistrationStatusName, UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { SESSION_STORAGE_KEYS } from '@/app/_types/sessionStorageKeys';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import ItemBase from '@/app/_ui/_shared/itemBase';
import ConfirmDialog from '@/app/_ui/dirty/conformDialog';
import { useDirty } from '@/app/_ui/dirty/dartyContext';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { searchUserDetail, updateUserDetail } from './_lib/fetcher';
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
export const UserDetailComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const id = (useParams().id as string) ?? '-';
  const queryClient = useQueryClient();

  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  const { setDirty } = useDirty();

  /* useState
  ------------------------------------------------------------------ */
  // TODO:ユーザー情報のユーザーステータスに差し替えする。
  const [userRegistrationStatus, setUserRegistrationStatus] = useState<UserRegistrationStatus>(
    UserRegistrationStatus.WAITING_APPROVAL
  );
  const [showNini, setShowNini] = useState<boolean>(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ステータス変更確認ダイアログ
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [userData, setUserData] = useState<UserDataDetailResult | undefined>();
  const [dialogActionHandler, setDialogActionHandler] = useState<() => void>(() => {
    return () => { };
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

  /* useQuery
  ------------------------------------------------------------------ */
  const searchUserDetailFetch = async () => {
    const req: ApiRequest<number> = { request: Number(id) };
    return searchUserDetail(req);
  };

  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<UserDataDetailResult>>({
    queryKey: [QUERY_KEYS.USER_DETAIL_INIT],
    queryFn: searchUserDetailFetch,
    enabled: true,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!result) {
      return;
    }
    if (!result.success) {
      openSnackbar(AlertType.ERROR, result.error.message);
      router.push('/user');
      return;
    }
    if (result.data) {
      console.log(result);
      const data = result.data;
      const initData: Partial<UserDetailFormValues> = {
        memo: data?.master_memo,
        usage_status: data?.usage_status as UsageStatus,
      };
      reset(initData);
      setUserRegistrationStatus(data.user_registration_status as UserRegistrationStatus);
      setUserData(result.data);
      setDataLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (isLoading) {
      openProcessing();
    } else {
      closeProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  /* functions - Update
  ------------------------------------------------------------------ */
  const updateHandler: SubmitHandler<UserDetailFormValues> = async (data) => {
    updateMutate.mutate(data);
  };

  const updateMutate = useMutation({
    mutationFn: async (data: UserDetailFormValues) => {
      openProcessing();
      return updateUserDetail(data) as unknown as ApiResponse<number>;
    },
    onSuccess: (res: ApiResponse<number>) => {
      if (res.success) {
        refetch();
        openSnackbar(AlertType.INFO, 'ユーザー情報を更新しました。');
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.error(e.message);
      openSnackbar(AlertType.ERROR, 'ユーザー情報の更新に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WAITING_APPROVAL_SEARCH_RESULT],
      });
      closeProcessing();
    },
  });

  /* functions - UpdateStatus
------------------------------------------------------------------ */
  const updateStatusHandler: SubmitHandler<UserDetailFormValues> = async (data) => {
    updateStatusMutate.mutate(data);
  };

  const updateStatusMutate = useMutation({
    mutationFn: async (data: UserDetailFormValues) => {
      openProcessing();
      return updateUserDetail(data) as unknown as ApiResponse<number>;
    },
    onSuccess: (res: ApiResponse<number>) => {
      if (res.success) {
        refetch();
        openSnackbar(AlertType.INFO, 'ユーザー情報を更新しました。');
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.error(e.message);
      openSnackbar(AlertType.ERROR, 'ユーザー情報の更新に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WAITING_APPROVAL_SEARCH_RESULT],
      });
      closeProcessing();
    },
  });

  /* functions
  ------------------------------------------------------------------ */

  /** 否認 */
  const disapprovalHandler = () => {
    // dialog setting
    setDialogMessage(`ユーザー情報を"否認"します。\nよろしいですか？`);
    setDialogActionHandler(() => updateStatusHandler);
    setOpenDialog(true);
  };

  /** 承認 */
  const approvalHandler = () => {
    // dialog setting
    setDialogMessage(`ユーザー情報を"承認"します。\n変更後、引き戻しはできませんがよろしいですか？`);
    setDialogActionHandler(() => updateStatusHandler);
    setOpenDialog(true);
  };

  /** 引き戻し */
  const pullBackHandler = () => {
    // dialog setting
    setDialogMessage(`ユーザー情報のステータスを"否認"から"承認待ち"に引き戻します。\nよろしいですか？`);
    setDialogActionHandler(() => updateStatusHandler);
    setOpenDialog(true);
  };

  /** 検索画面に戻る */
  const pageBack = async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.PREVIOUS_PATH, '/userDetail');
    router.push('/user');
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
          <Button sx={{ mr: 3 }} variant="outlined" startIcon={<ArrowBack />} onClick={() => pageBack()}>
            戻る
          </Button>
        </Grid>
        <Divider />
        <Box sx={{ m: 3 }}>
          {dataLoaded && (
            <form onSubmit={handleSubmit(updateHandler)}>
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
                {userData?.t_companies.optional_item_title_1 && (
                  <ItemBase name={userData.t_companies.optional_item_title_1} isRequired={2}>
                    <TextField
                      size="small"
                      color={'primary'}
                      name="shopName"
                      fullWidth
                      sx={{ backgroundColor: 'lightgray' }}
                      disabled
                      placeholder={userData?.t_companies.optional_item_notes_1}
                      value={userData?.optional_item_answer_1}
                    />
                  </ItemBase>
                )}
                {userData?.t_companies.optional_item_title_2 && (
                  <ItemBase name={userData.t_companies.optional_item_title_2} isRequired={2}>
                    <TextField
                      size="small"
                      color={'primary'}
                      name="shopName"
                      fullWidth
                      sx={{ backgroundColor: 'lightgray' }}
                      disabled
                      placeholder={userData.t_companies.optional_item_notes_2}
                      value={userData?.optional_item_answer_2}
                    />
                  </ItemBase>
                )}
                <ItemBase name={'登録ステータス'} isRequired={2}>
                  <TextField
                    size="small"
                    color={'primary'}
                    name="shopName"
                    fullWidth
                    sx={{ backgroundColor: 'lightgray' }}
                    disabled
                    value={convertUserRegistrationStatusName(userRegistrationStatus)}
                  />
                </ItemBase>
                {userRegistrationStatus === UserRegistrationStatus.REGISTERED && (
                  <>
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
                  </>
                )}
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', mt: 2, gap: 2 }}>
                {/* 登録済みの場合 */}
                {userRegistrationStatus === UserRegistrationStatus.REGISTERED && (
                  <Button fullWidth variant="contained" type={'submit'}>
                    更新
                  </Button>
                )}
                {/* 否認の場合 */}
                {userRegistrationStatus === UserRegistrationStatus.DISAPPROVAL && (
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
                {/* 承認待ちの場合 */}
                {userRegistrationStatus === UserRegistrationStatus.WAITING_APPROVAL && (
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
