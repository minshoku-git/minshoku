'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowBack, Search } from '@mui/icons-material';
import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ja } from 'date-fns/locale/ja';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement, TextFieldElement } from 'react-hook-form-mui';
import { TimePickerElement } from 'react-hook-form-mui/date-pickers';

import { getAddress } from '@/app/_lib/getAddress';
import { getTodayXHour } from '@/app/_lib/getDateTime';
import { checkTempId, getEditFlag } from '@/app/_lib/utill';
import { TEMP_HYPHEN } from '@/app/_types/constants';
import { AlertType, UsageStatus } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { SESSION_STORAGE_KEYS } from '@/app/_types/sessionStorageKeys';
import { ApiRequest, ApiResponse, DepartmentData, EmploymentData } from '@/app/_types/types';
import { DepartmentInput } from '@/app/_ui/_shared/departmentInput';
import { EmploymentInput } from '@/app/_ui/_shared/employmentInput';
import ItemBase from '@/app/_ui/_shared/itemBase';
import { useDirty } from '@/app/_ui/dirty/dartyContext';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { insertCompanyDetail, searchCompanyDetail, updateCompanyDetail } from './_lib/fetcher';
import { CompanyDetailFormValues, CompanyDetailResult, CompanyDetailSchema } from './_lib/types';

/** ページ名 */
const pageName = '会社詳細';

/**
 * 会社詳細コンポーネント
 * @returns {JSX.Element} JSX
 */
export const CompanyComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const { openSnackbar } = useSnackBar();
  const { setDirty } = useDirty();
  const { openProcessing, closeProcessing } = useProcessing();
  const queryClient = useQueryClient();
  const router = useRouter();
  const id = (useParams().id as string) ?? '-';
  const editMode = useMemo(() => getEditFlag(id), [id]);

  /* useState
  ------------------------------------------------------------------ */
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');

  const [tempIdCounterDep, setTempIdCounterDep] = useState<number>(1);
  const [tempIdCounterEmp, setTempIdCounterEmp] = useState<number>(1);
  const [tempIdCounterDomain, setTempIdCounterDomain] = useState<number>(1);

  const [deleteDepArray, setDeleteDepArray] = useState<DepartmentData[]>([]);
  const [deleteEmpArray, setDeleteEmpArray] = useState<EmploymentData[]>([]);
  const [deleteDomainArray, setDeleteDomainArray] = useState<DepartmentData[]>([]);

  const [addressLoading, setAddressLoading] = useState<boolean>(false);

  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { isDirty },
  } = useForm<CompanyDetailFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(CompanyDetailSchema),
    defaultValues: getInitData(null),
  });

  /* useQuery
  ------------------------------------------------------------------ */
  const searchCompanyDetailFetch = async () => {
    const req: ApiRequest<number> = { request: Number(id) };
    return searchCompanyDetail(req);
  };

  const {
    data: result,
    isLoading,
    refetch,
  } = useQuery<ApiResponse<CompanyDetailResult>>({
    queryKey: [QUERY_KEYS.COMPANY_SEARCH_RESULT],
    queryFn: searchCompanyDetailFetch,
    enabled: editMode,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!editMode) {
      setDataLoaded(true);
      return;
    }
    if (!result) {
      return;
    }
    if (!result.success) {
      openSnackbar(AlertType.WARNING, result.error.message);
      router.push('/company');
    }
    else if (result.data) {
      const data = result.data;
      const conversion: CompanyDetailFormValues = {
        ...data,
        offer_time_to: new Date(data.offer_time_to),
        offer_time_from: new Date(data.offer_time_from),
        order_period_time: new Date(data.order_period_time),
        cancel_period_time: new Date(data.cancel_period_time),
      };
      reset(getInitData(conversion));
      setUrl(result.data.url)
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

  /* useFieldArray 部署情報
  ------------------------------------------------------------------ */
  const {
    fields: fields_dep,
    append: append_dep,
    remove: remove_deb,
  } = useFieldArray({ control: control, name: 'departmentInfo' });

  const addField_dep = () => {
    append_dep({
      id: TEMP_HYPHEN + tempIdCounterDep,
      name: '',
      disabled: false,
      delete_flag: false,
    });
    setTempIdCounterDep((x) => x + 1);
  };

  const removeField_dep = (id: string) => {
    const delIndex = fields_dep.findIndex((f) => f.id === id);

    if (!checkTempId(id)) {
      const data = getValues('departmentInfo') as DepartmentData[];
      const target = data[delIndex];
      setDeleteDepArray([...deleteDepArray, { ...target, delete_flag: true }]);
    }
    remove_deb(delIndex);
    console.log('deleteDepArray:', deleteDepArray);
  };

  /* useFieldArray 雇用種別情報
  ------------------------------------------------------------------ */
  const {
    fields: fields_emp,
    append: append_emp,
    remove: remove_emp,
  } = useFieldArray({ control: control, name: 'employmentStatusInfo' });

  const addField_emp = () => {
    append_emp({
      id: TEMP_HYPHEN + tempIdCounterEmp,
      employment_status_name: '',
      credit_flag: false,
      paypay_flag: false,
      deduction_flag: false,
      set_meal_burden: '0',
      disabled: false,
      delete_flag: false,
    });
    setTempIdCounterEmp((x) => x + 1);
  };

  const removeField_emp = (id: string) => {
    const delIndex = fields_emp.findIndex((f) => f.id === id);

    if (!checkTempId(id)) {
      const data = getValues('employmentStatusInfo') as EmploymentData[];
      const target = data[delIndex];
      setDeleteEmpArray([...deleteEmpArray, { ...target, delete_flag: true }]);
    }
    remove_emp(delIndex);
    console.log('deleteEmpArray:', deleteEmpArray);
  };

  /* useFieldArray ドメイン情報
   ------------------------------------------------------------------ */
  const {
    fields: fields_domain,
    append: append_domain,
    remove: remove_domain,
  } = useFieldArray({ control: control, name: 'domain' });

  const addField_domain = () => {
    append_domain({
      id: TEMP_HYPHEN + tempIdCounterDomain,
      name: '',
      disabled: false,
      delete_flag: false,
    });
    setTempIdCounterDomain((x) => x + 1);
  };

  const removeField_domain = (id: string) => {
    const delIndex = fields_domain.findIndex((f) => f.id === id);

    if (!checkTempId(id)) {
      const data = getValues('domain') as DepartmentData[];
      const target = data[delIndex];
      setDeleteDomainArray([...deleteDomainArray, { ...target, delete_flag: true }]);
    }
    remove_domain(delIndex);
    console.log('domain:', deleteDomainArray);
  };

  /* functions - Insert
  ------------------------------------------------------------------ */
  const insertHandler: SubmitHandler<CompanyDetailFormValues> = async (data) => {
    insertMutate.mutate(data);
  };

  const insertMutate = useMutation({
    mutationFn: async (data: CompanyDetailFormValues) => {
      openProcessing();
      const req: ApiRequest<CompanyDetailFormValues> = { request: data }
      return insertCompanyDetail(req) as unknown as ApiResponse<number>;
    },
    onSuccess: (res) => {
      if (res.success) {
        openSnackbar(AlertType.SUCCESS, '会社情報の登録が完了しました。');
        router.push(`/company-detail/${res.data}`);
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.log(e.message);
      openSnackbar(AlertType.ERROR, '会社情報の新規登録に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - Update
  ------------------------------------------------------------------ */
  const updateHandler: SubmitHandler<CompanyDetailFormValues> = async (data) => {
    updateMutate.mutate(data);
  };

  const updateMutate = useMutation({
    mutationFn: async (data: CompanyDetailFormValues) => {
      openProcessing();
      return updateCompanyDetail(data) as unknown as ApiResponse<number>;
    },
    onSuccess: (res: ApiResponse<number>) => {
      if (res.success) {
        refetch();
        openSnackbar(AlertType.SUCCESS, '会社情報の更新が完了しました。');
        router.push(`/company-detail/${res.data}`);
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.error(e.message);
      openSnackbar(AlertType.ERROR, '会社情報の更新に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - clickboardHandler
  ------------------------------------------------------------------ */
  /* 'URLと案内文をコピー'ハンドラー */
  // TODO: メッセージ文連携待ち＋URL設定忘れずに
  const message =
    `クリップボードのテストメッセージです。\nURL: ${url}`;
  const isBrowser = typeof window !== 'undefined';
  const clickboardHandler = async () => {
    if (!isBrowser) return;
    openSnackbar(AlertType.SUCCESS, 'クリップボードにコピーしました。');
    await navigator.clipboard.writeText(message);
  };

  // 住所取得
  const getAddressHandler = async () => {
    setAddressLoading(true);
    const { prefecture, suburb, city, errorMessage } = await getAddress(
      getValues('postal_code_prefix') + getValues('postal_code_suffix')
    );

    if (errorMessage) {
      setValue('address', '');
      openSnackbar(AlertType.WARNING, errorMessage);
    } else {
      setValue('address', prefecture + city + suburb);
    }
    setAddressLoading(false);
    return;
  };

  /** 検索画面に戻る */
  const pageBack = async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.PREVIOUS_PATH, '/company-detail');
    router.push('/company');
  };

  /* dirty
  ------------------------------------------------------------------ */
  useEffect(() => {
    setDirty(isDirty);
  }, [isDirty, setDirty]);

  useEffect(() => {
    return () => {
      // 画面離脱時にクエリを無効化・再フェッチ予約する。
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMPANY_SEARCH_RESULT] });
      setDirty(false); // CleanUp
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  // 時間の選択肢を一度に生成する関数
  const selectOptions = useMemo(() => {
    const day = selectOptionCreate(10);
    const hours = selectOptionCreate(23);
    const minutes = selectOptionCreate(59);
    return { hours, minutes, day };
  }, []);

  // 時間の選択肢を生成する関数
  function selectOptionCreate(max: number) {
    const hours = [{ id: '', label: '未選択' }];
    for (let i = 0; i <= max; i++) {
      hours.push({ id: i.toString(), label: i.toString() });
    }
    return hours;
  }

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* タイトル */}
        <Grid container alignItems="center">
          <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ px: 3, py: 2, mb: 0 }}>
            {pageName}
          </Typography>
          {editMode && (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <Button sx={{ mr: 3 }} variant="outlined" startIcon={<ArrowBack />} onClick={() => pageBack()}>
                戻る
              </Button>
            </>
          )}
        </Grid>
        <Divider />
        {dataLoaded && editMode && (
          <Box sx={{ m: 3, mb: 0, display: 'flex' }}>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" onClick={clickboardHandler}>
              URLと案内文をコピーする
            </Button>
          </Box>
        )}
        <Box sx={{ m: 3 }}>
          {dataLoaded && (
            <form onSubmit={handleSubmit(editMode ? updateHandler : insertHandler)}>
              <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} direction="column">
                {editMode && (
                  <>
                    <ItemBase name={'ユーザー登録URL'} isRequired={2}>
                      <TextField
                        size="small"
                        color={'primary'}
                        name="userUrl"
                        fullWidth
                        disabled
                        sx={{ backgroundColor: 'lightgray' }}
                        slotProps={{ htmlInput: { maxLength: 64 } }}
                        value={url}
                      />
                    </ItemBase>
                    <ItemBase name={'会社ID'} isRequired={2}>
                      <TextFieldElement
                        control={control}
                        size="small"
                        color={'primary'}
                        name="id"
                        fullWidth
                        disabled
                        sx={{ backgroundColor: 'lightgray' }}
                        slotProps={{ htmlInput: { maxLength: 64 } }}
                      />
                    </ItemBase>
                  </>
                )}
                <ItemBase name={'会社名'} isRequired={0}>
                  <TextFieldElement control={control} size="small" color={'primary'} name="company_name" fullWidth />
                </ItemBase>
                <ItemBase name={'支店名'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="branch_name"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 256 } }}
                  />
                </ItemBase>
                <ItemBase name={'食堂名'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="restaurant_name"
                    slotProps={{ htmlInput: { maxLength: 7 } }}
                    fullWidth
                  />
                </ItemBase>
                <ItemBase name={'郵便番号'} isRequired={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'start',
                      width: '640px',
                    }}
                    gap={2}
                  >
                    <TextFieldElement
                      control={control}
                      size="small"
                      color="primary"
                      name="postal_code_prefix"
                      sx={{ width: '80px' }}
                      slotProps={{ htmlInput: { maxLength: 3 } }}
                    />
                    <Box
                      sx={{
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ mx: 0 }}>{'-'}</Typography>
                    </Box>
                    <TextFieldElement
                      control={control}
                      size="small"
                      color="primary"
                      name="postal_code_suffix"
                      sx={{ width: '80px' }}
                      slotProps={{ htmlInput: { maxLength: 4 } }}
                    />
                    <Button
                      startIcon={<Search />}
                      color="primary"
                      variant="outlined"
                      loading={addressLoading}
                      onClick={() => getAddressHandler()}
                    >
                      {'住所検索'}
                    </Button>
                  </Box>
                </ItemBase>
                <ItemBase name={'住所'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color="primary"
                    name="address"
                    fullWidth
                  // slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                </ItemBase>
                <ItemBase name={'番地'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="area_block_number"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                </ItemBase>
                <ItemBase name={'建物名'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color="primary"
                    name="building_name"
                    fullWidth
                    placeholder="建物名・階数など"
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                </ItemBase>
                <ItemBase name={'メールアドレス'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    type="email"
                    name="email"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 256 } }}
                  />
                </ItemBase>
                <ItemBase name={'連絡先・メモ'} isRequired={1}>
                  <TextareaAutosizeElement
                    control={control}
                    size="small"
                    color="primary"
                    name="memo"
                    minRows={3}
                    resizeStyle="vertical"
                    fullWidth
                  />
                </ItemBase>
                <ItemBase name={'部署情報'} isRequired={0}>
                  <DepartmentInput
                    name="departmentInfo"
                    control={control}
                    fields={fields_dep}
                    addField={addField_dep}
                    removeField={removeField_dep}
                    setValue={setValue}
                  />
                </ItemBase>
                <ItemBase name={'雇用種別情報'} isRequired={0}>
                  <EmploymentInput
                    control={control}
                    fields={fields_emp}
                    addField={addField_emp}
                    removeField={removeField_emp}
                    setValue={setValue}
                  />
                </ItemBase>
                <ItemBase name={'ドメイン情報'} isRequired={0}>
                  <DepartmentInput
                    name="domain"
                    control={control}
                    fields={fields_domain}
                    addField={addField_domain}
                    removeField={removeField_domain}
                    setValue={setValue}
                    prefix="@"
                  />
                </ItemBase>
                <ItemBase name={'提供場所'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color="primary"
                    name="location"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                </ItemBase>
                <ItemBase name={'提供時間'} isRequired={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      width: '640px',
                    }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                      <TimePickerElement
                        control={control}
                        name={'offer_time_from'}
                        ampm={false}
                        timeSteps={{ hours: 1, minutes: 5 }}
                        sx={TimePickerStyle}
                        slotProps={{
                          textField: { size: 'small' },
                          inputAdornment: {},
                        }}
                      />
                      <Box
                        sx={{
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography sx={{ mx: 1 }}>{'～'}</Typography>
                      </Box>
                      <TimePickerElement
                        control={control}
                        name={'offer_time_to'}
                        ampm={false}
                        timeSteps={{ hours: 1, minutes: 5 }}
                        sx={TimePickerStyle}
                        slotProps={{ textField: { size: 'small' } }}
                      />
                    </LocalizationProvider>
                  </Box>
                </ItemBase>
                <ItemBase name={'注文期限'} isRequired={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      width: '640px',
                    }}
                    gap={1}
                  >
                    <SelectElement
                      control={control}
                      size="small"
                      name="order_period_day"
                      fullWidth
                      options={selectOptions.day}
                      sx={{ width: '80px' }}
                    ></SelectElement>
                    <Box
                      sx={{
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ whiteSpace: 'nowrap' }}>{'日前'}</Typography>
                    </Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                      <TimePickerElement
                        control={control}
                        name={'order_period_time'}
                        ampm={false}
                        timeSteps={{ hours: 1, minutes: 5 }}
                        sx={TimePickerStyle}
                        slotProps={{
                          textField: { size: 'small' },
                          inputAdornment: {},
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                </ItemBase>
                <ItemBase name={'キャンセル期限'} isRequired={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      width: '640px',
                    }}
                    gap={1}
                  >
                    <SelectElement
                      control={control}
                      size="small"
                      name="cancel_period_day"
                      fullWidth
                      options={selectOptions.day}
                      sx={{ width: '80px' }}
                    ></SelectElement>
                    <Box
                      sx={{
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ whiteSpace: 'nowrap' }}>{'日前'}</Typography>
                    </Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                      <TimePickerElement
                        control={control}
                        name={'cancel_period_time'}
                        ampm={false}
                        timeSteps={{ hours: 1, minutes: 5 }}
                        sx={TimePickerStyle}
                        slotProps={{
                          textField: { size: 'small' },
                          inputAdornment: {},
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                </ItemBase>
                <ItemBase name={'任意項目1'} isRequired={1}>
                  <Box>
                    <TextFieldElement
                      control={control}
                      size="small"
                      color="primary"
                      name="optional_item_title_1"
                      label="項目名"
                      sx={{ width: '640px', mb: 1 }}
                      slotProps={{ htmlInput: { maxLength: 128 } }}
                    />
                    <TextFieldElement
                      control={control}
                      size="small"
                      color="primary"
                      name="optional_item_notes_1"
                      label="注釈"
                      sx={{ width: '640px' }}
                      slotProps={{ htmlInput: { maxLength: 128 } }}
                    />
                  </Box>
                </ItemBase>
                <ItemBase name={'任意項目2'} isRequired={1}>
                  <Box>
                    <TextFieldElement
                      control={control}
                      size="small"
                      color="primary"
                      name="optional_item_title_2"
                      label="項目名"
                      sx={{ width: '640px', mb: 1 }}
                      slotProps={{ htmlInput: { maxLength: 128 } }}
                    />
                    <TextFieldElement
                      control={control}
                      size="small"
                      color="primary"
                      name="optional_item_notes_2"
                      label="注釈"
                      sx={{ width: '640px' }}
                      slotProps={{ htmlInput: { maxLength: 128 } }}
                    />
                  </Box>
                </ItemBase>
                <ItemBase name={'利用ステータス'} isRequired={0}>
                  <SelectElement
                    control={control}
                    size="small"
                    name="usage_status"
                    fullWidth
                    options={[
                      { id: UsageStatus.AVAILABLE, label: '利用可能' },
                      {
                        id: UsageStatus.DEACTIVATION,
                        label: '利用停止',
                      },
                    ]}
                  ></SelectElement>
                </ItemBase>
              </Grid>
              {/* 登録・更新ボタン */}
              <Grid sx={{ mt: 2 }} size={{ xs: 12 }}>
                <Button fullWidth variant="contained" type="submit">
                  {editMode ? '更新' : '登録'}
                </Button>
              </Grid>
            </form>
          )}
        </Box>
      </Paper>
    </>
  );
};

const TimePickerStyle = {
  width: '150px',
  '& .MuiInputBase-root': {
    height: '40px',
    textAlign: 'center',
    verticalAlign: 'center',
    padding: '0 15px',
  },
  '& input': {
    padding: '0',
  },
};

/** formValues初期値 */
const getInitData = (data: CompanyDetailFormValues | null) => {
  const depInit: DepartmentData[] =
    data && data.departmentInfo.length > 0
      ? data?.departmentInfo
      : [
        {
          id: TEMP_HYPHEN + 0,
          name: '設定なし',
          disabled: false,
          delete_flag: false,
        },
      ];

  const empInit: EmploymentData[] =
    data && data.employmentStatusInfo.length > 0
      ? data.employmentStatusInfo
      : [
        {
          id: TEMP_HYPHEN + 0,
          employment_status_name: '社員',
          credit_flag: false,
          paypay_flag: false,
          deduction_flag: false,
          set_meal_burden: '0',
          disabled: false,
          delete_flag: false,
        },
      ];

  const domainInit: DepartmentData[] =
    data && data.domain.length > 0
      ? data?.domain
      : [
        {
          id: TEMP_HYPHEN + 0,
          name: '',
          disabled: false,
          delete_flag: false,
        },
      ];

  const initValues: CompanyDetailFormValues = {
    id: data?.id ? data?.id.toString() : '-',
    departmentInfo: depInit,
    employmentStatusInfo: empInit,
    domain: domainInit,
    company_name: data?.company_name ?? '',
    branch_name: data?.branch_name ?? '',
    postal_code_prefix: data?.postal_code_prefix ?? '',
    postal_code_suffix: data?.postal_code_suffix ?? '',
    address: data?.address ?? '',
    area_block_number: data?.area_block_number ?? '',
    building_name: data?.building_name ?? '',
    restaurant_name: data?.restaurant_name ?? '',
    email: data?.email ?? '',
    memo: data?.memo ?? '',
    location: data?.location ?? '',
    offer_time_from: data?.offer_time_from ?? getTodayXHour(12), // 12時
    offer_time_to: data?.offer_time_to ?? getTodayXHour(13), // 13時
    cancel_period_day: data?.cancel_period_day ? data?.cancel_period_day.toString() : '0',
    cancel_period_time: data?.cancel_period_time ?? getTodayXHour(13), // 13時
    order_period_day: data?.order_period_day ? data?.order_period_day.toString() : '0',
    order_period_time: data?.order_period_time ?? getTodayXHour(12), // 12時
    optional_item_title_1: data?.optional_item_title_1 ?? '',
    optional_item_title_2: data?.optional_item_title_2 ?? '',
    optional_item_notes_1: data?.optional_item_notes_1 ?? '',
    optional_item_notes_2: data?.optional_item_notes_2 ?? '',
    usage_status: data?.usage_status ?? UsageStatus.AVAILABLE,
  };

  return initValues;
};
