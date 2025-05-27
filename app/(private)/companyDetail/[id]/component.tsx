'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { ja } from 'date-fns/locale/ja';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import {
  SelectElement,
  TextareaAutosizeElement,
  TextFieldElement,
} from 'react-hook-form-mui';
import { TimePickerElement } from 'react-hook-form-mui/date-pickers';

import {
  getComponyDetail,
  insertComponyDetail,
  updateComponyDetail,
} from '@/app/_actions/actions';
import { DepartmentData, EmploymentData } from '@/app/_lib/createMockData';
import { getTodayZeroHour } from '@/app/_lib/getDateTime';
import { checkTempId, getEditFlag } from '@/app/_lib/utill';
import { AlertType, UsageStatus } from '@/app/_types/enum';
import {
  CompanyDetailFormValues,
  CompanyDetailSchema,
} from '@/app/_types/types';
import { TEMP_HYPHEN } from '@/app/_types/values';
import { DepartmentInput } from '@/app/_ui/_shared/departmentInput';
import { EmploymentInput } from '@/app/_ui/_shared/employmentInput';
import ItemBase from '@/app/_ui/_shared/itemBase';
import { useDirty } from '@/app/_ui/dirty/dartyContext';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { state as stateMockData } from '../../../../public/state.json';

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
  const router = useRouter();
  const params = useParams();
  const id = (params.id as string) ?? '-';
  const tempHypen = TEMP_HYPHEN()

  /* useState
  ------------------------------------------------------------------ */
  const editMode = useMemo(() => getEditFlag(id), [id]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [tempIdCounterDep, setTempIdCounterDep] = useState<number>(1);
  const [tempIdCounterEmp, setTempIdCounterEmp] = useState<number>(1);

  const [deleteDepArray, setDeleteDepArray] = useState<DepartmentData[]>([]);
  const [deleteEmpArray, setDeleteEmpArray] = useState<EmploymentData[]>([]);


  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { isDirty, dirtyFields },
  } = useForm<CompanyDetailFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(CompanyDetailSchema),
    defaultValues: getInitData(null),
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!editMode) {
      reset();
      setDataLoaded(true);
      return;
    } else {
      getInit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 初期表示データ取得 */
  const getInit = async () => {
    try {
      openProcessing();
      const data = (await getComponyDetail({ request: Number(id) })).data;
      if (!data?.id) {
        openSnackbar(
          AlertType.ERROR,
          '会社情報の取得に失敗しました。再度お試しください。'
        );
        router.push('/company');
        return;
      }
      reset(getInitData(data));
    } catch (error) {
      console.error('取得失敗:', error);
    } finally {
      setDataLoaded(true);
      closeProcessing();
    }
  };

  /* useFieldArray 部署情報
  ------------------------------------------------------------------ */
  const {
    fields: fields_dep,
    append: append_dep,
    remove: remove_deb,
  } = useFieldArray({ control: control, name: 'departmentInfo' });

  const addField_dep = () => {
    append_dep({
      id: tempHypen + tempIdCounterDep,
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
      id: tempHypen + tempIdCounterEmp,
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

  const removeField_emp = (index: string) => {
    const delIndex = fields_emp.findIndex((f) => f.id === id);
    if (!checkTempId(id)) {
      const data = getValues('employmentStatusInfo') as EmploymentData[];
      const target = data[delIndex];
      setDeleteEmpArray([...deleteEmpArray, { ...target, delete_flag: true }]);
    }
    remove_emp(delIndex);
    console.log('deleteEmpArray:', deleteEmpArray);
  };

  /* functions
  ------------------------------------------------------------------ */
  /* 新規登録ハンドラー */
  const insertHandler: SubmitHandler<CompanyDetailFormValues> = async (
    data
  ) => {
    console.log('登録データ:', data);
    openProcessing();
    const res = await insertComponyDetail({
      request: data,
    });
    if (res.error) {
      openSnackbar(
        AlertType.ERROR,
        '会社情報の新規登録に失敗しました。再度お試しください。' + res.error
      );
    } else {
      openSnackbar(AlertType.SUCCESS, '会社情報の登録が完了しました。');
      router.push(`/companyDetail/${res.data}`);
    }
    closeProcessing();
  };

  /* 更新ハンドラー */
  const updateHandler: SubmitHandler<CompanyDetailFormValues> = async (
    data
  ) => {
    openProcessing();
    const res = await updateComponyDetail({
      request: {
        ...data,
        departmentInfo: [...data.departmentInfo, ...deleteDepArray],
        employmentStatusInfo: [...data.employmentStatusInfo, ...deleteEmpArray],
      },
    });

    if (res.error) {
      openSnackbar(
        AlertType.ERROR,
        '会社情報の更新に失敗しました。再度お試しください。' + res.error
      );
    } else {
      await getInit();
      window.scrollTo(0, 0)
      openSnackbar(AlertType.SUCCESS, '会社情報の更新が完了しました。');
    }
    closeProcessing();
  };

  console.log('dirtyFields', dirtyFields);

  /* 'URLと案内文をコピー'ハンドラー */
  const message =
    'クリップボードのテストメッセージです。\nクリップボードのテストメッセージです。\nクリップボードのテストメッセージです。';
  const isBrowser = typeof window !== 'undefined';
  const clickboardHandler = async () => {
    if (!isBrowser) return;
    openSnackbar(AlertType.SUCCESS, 'クリップボードにコピーしました。');
    await navigator.clipboard.writeText(message);
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

  // 都道府県をモックから取得
  const stateData = [
    { id: '', label: '未選択' },
    ...stateMockData.map((d: string, index: number) => {
      return { id: index.toString(), label: d };
    }),
  ];

  // // 郵便番号検索のおためし
  // const kensaku = () => {
  //   console.log('やほー！');

  //   const postcode = getValues('post_code');
  //   if (postcode.length !== 7) {
  //     closeSnackbar();
  //     openSnackbar(AlertType.WARNING, '住所を取得できませんでした。番号をお確かめの上、再度お試しください。');
  //     return;
  //   }

  //   const url = `https://postcode.teraren.com/postcodes/${postcode}.json`;

  //   fetch(url)
  //     .then((response) => response.json())
  //     .then((json) => {
  //       const prefecture = json.prefecture;
  //       const city = json.city;
  //       const suburb = json.suburb;
  //       const address = prefecture + city + suburb;
  //       console.log('address:' + address);
  //       if (!address) {
  //         setValue('otameshi', '');
  //         openSnackbar(AlertType.WARNING, '住所を取得できませんでした。番号をお確かめの上、再度お試しください。');
  //       }
  //       setValue('otameshi', address);
  //     })
  //     .catch((error) => {
  //       setValue('otameshi', '');
  //       openSnackbar(AlertType.WARNING, '住所を取得できませんでした。番号をお確かめの上、再度お試しください。');
  //       console.error(error);
  //     });
  // };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* タイトル */}
        <Grid container alignItems='center'>
          <Typography
            component='h2'
            variant='h6'
            color='primary'
            gutterBottom
            sx={{ px: 3, py: 2, mb: 0 }}
          >
            {pageName}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
        </Grid>
        <Divider />
        {editMode && (
          <Box sx={{ m: 3, mb: 0, display: 'flex' }}>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant='contained' onClick={clickboardHandler}>
              URLと案内文をコピーする
            </Button>
          </Box>
        )}
        <Box sx={{ m: 3 }}>
          {dataLoaded && (
            <form
              onSubmit={handleSubmit(editMode ? updateHandler : insertHandler)}
            >
              <Grid
                container
                rowSpacing={2}
                columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                direction='column'
              >
                {editMode && (
                  <>
                    <ItemBase name={'ユーザー登録URL'} isRequired={2}>
                      <TextField
                        size='small'
                        color={'primary'}
                        name='userUrl'
                        fullWidth
                        disabled
                        sx={{ backgroundColor: 'lightgray' }}
                        slotProps={{ htmlInput: { maxLength: 64 } }}
                        value={'https://xxxxxxxxxxxxx/login/refact'}
                      />
                    </ItemBase>
                    <ItemBase name={'会社ID'} isRequired={2}>
                      <TextFieldElement
                        control={control}
                        size='small'
                        color={'primary'}
                        name='id'
                        fullWidth
                        disabled
                        sx={{ backgroundColor: 'lightgray' }}
                        slotProps={{ htmlInput: { maxLength: 64 } }}
                      />
                    </ItemBase>
                  </>
                )}
                <ItemBase name={'会社名'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size='small'
                    color={'primary'}
                    name='company_name'
                    fullWidth
                  />
                </ItemBase>
                <ItemBase name={'支店名'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size='small'
                    color={'primary'}
                    name='branch_name'
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 256 } }}
                  />
                </ItemBase>
                <ItemBase name={'食堂名'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size='small'
                    color={'primary'}
                    name='restaurant_name'
                    slotProps={{ htmlInput: { maxLength: 7 } }}
                    fullWidth
                  />
                </ItemBase>
                <ItemBase name={'郵便番号'} isRequired={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      width: '640px',
                    }}
                    gap={2}
                  >
                    <TextFieldElement
                      control={control}
                      size='small'
                      color={'primary'}
                      name='post_code'
                      fullWidth
                      slotProps={{ htmlInput: { maxLength: 7 } }}
                    />
                  </Box>
                </ItemBase>
                <ItemBase name={'住所'} isRequired={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      width: '640px',
                    }}
                    gap={2}
                  >
                    <SelectElement
                      control={control}
                      size='small'
                      name='prefectures'
                      label='都道府県'
                      fullWidth
                      options={stateData}
                    ></SelectElement>
                    <SelectElement
                      control={control}
                      size='small'
                      name='municipalities'
                      label='市区'
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
                      size='small'
                      name='town_area'
                      label='町村'
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
                <ItemBase name={'番地'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size='small'
                    color={'primary'}
                    name='area_block_number'
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                </ItemBase>
                <ItemBase name={'建物名'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size='small'
                    color={'primary'}
                    name='building_name'
                    fullWidth
                    placeholder='建物名・階数など'
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                </ItemBase>
                <ItemBase name={'提供場所'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size='small'
                    color={'primary'}
                    name='location'
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                </ItemBase>
                <ItemBase name={'メールアドレス'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size='small'
                    color={'primary'}
                    type='email'
                    name='mailaddress'
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 256 } }}
                  />
                </ItemBase>
                <ItemBase name={'連絡先・メモ'} isRequired={1}>
                  <TextareaAutosizeElement
                    control={control}
                    size='small'
                    color={'primary'}
                    name='memo'
                    minRows={3}
                    resizeStyle='vertical'
                    fullWidth
                  />
                </ItemBase>
                <ItemBase name={'部署情報'} isRequired={0}>
                  <DepartmentInput
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
                <ItemBase name={'任意項目1'} isRequired={1}>
                  <Box>
                    <TextFieldElement
                      control={control}
                      size='small'
                      color={'primary'}
                      name='optional_item_title_1'
                      label='項目名'
                      sx={{ width: '640px', mb: 1 }}
                      slotProps={{ htmlInput: { maxLength: 128 } }}
                    />
                    <TextFieldElement
                      control={control}
                      size='small'
                      color={'primary'}
                      name='optional_item_notes_1'
                      label='注釈'
                      sx={{ width: '640px' }}
                      slotProps={{ htmlInput: { maxLength: 128 } }}
                    />
                  </Box>
                </ItemBase>
                <ItemBase name={'任意項目2'} isRequired={1}>
                  <Box>
                    <TextFieldElement
                      control={control}
                      size='small'
                      color={'primary'}
                      name='optional_item_title_2'
                      label='項目名'
                      sx={{ width: '640px', mb: 1 }}
                      slotProps={{ htmlInput: { maxLength: 128 } }}
                    />
                    <TextFieldElement
                      control={control}
                      size='small'
                      color={'primary'}
                      name='optional_item_notes_2'
                      label='注釈'
                      sx={{ width: '640px' }}
                      slotProps={{ htmlInput: { maxLength: 128 } }}
                    />
                  </Box>
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
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={ja}
                    >
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
                      size='small'
                      name='order_period_day'
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
                      <Typography sx={{ whiteSpace: 'nowrap' }}>
                        {'日前'}
                      </Typography>
                    </Box>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={ja}
                    >
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
                      /></LocalizationProvider>
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
                      size='small'
                      name='cancel_period_day'
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
                      <Typography sx={{ whiteSpace: 'nowrap' }}>
                        {'日前'}
                      </Typography>
                    </Box>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={ja}
                    >
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

                <ItemBase name={'利用ステータス'} isRequired={0}>
                  <SelectElement
                    control={control}
                    size='small'
                    name='usage_status'
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
                <Button fullWidth variant='contained' type='submit'>
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
    (data && data.departmentInfo.length > 0)
      ? data?.departmentInfo
      : [{
        id: TEMP_HYPHEN() + 0,
        name: '設定なし',
        disabled: false,
        delete_flag: false
      }];

  const empInit: EmploymentData[] =
    (data && data.employmentStatusInfo.length > 0)
      ? data.employmentStatusInfo
      : [
        {
          id: TEMP_HYPHEN() + 0,
          employment_status_name: '社員',
          credit_flag: false,
          paypay_flag: false,
          deduction_flag: false,
          set_meal_burden: '0',
          disabled: false,
          delete_flag: false,
        },
      ];

  const initData: CompanyDetailFormValues = {
    id: data?.id ? data?.id.toString() : '-',
    departmentInfo: depInit,
    employmentStatusInfo: empInit,
    company_name: data?.company_name ?? '',
    branch_name: data?.branch_name ?? '',
    post_code: data?.post_code ?? '',
    prefectures: data?.prefectures ?? '',
    municipalities: data?.municipalities ?? '',
    town_area: data?.town_area ?? '',
    area_block_number: data?.area_block_number ?? '',
    building_name: data?.building_name ?? '',
    restaurant_name: data?.restaurant_name ?? '',
    mailaddress: data?.mailaddress ?? '',
    memo: data?.memo ?? '',
    location: data?.location ?? '',
    offer_time_from: data?.offer_time_from ?? getTodayZeroHour(),
    offer_time_to: data?.offer_time_to ?? getTodayZeroHour(),
    cancel_period_day: data?.cancel_period_day
      ? data?.cancel_period_day.toString()
      : '',
    cancel_period_time: data?.cancel_period_time ?? getTodayZeroHour(),
    order_period_day: data?.order_period_day
      ? data?.order_period_day.toString()
      : '',
    order_period_time: data?.order_period_time ?? getTodayZeroHour(),
    optional_item_title_1: data?.optional_item_title_1 ?? '',
    optional_item_title_2: data?.optional_item_title_2 ?? '',
    optional_item_notes_1: data?.optional_item_notes_1 ?? '',
    optional_item_notes_2: data?.optional_item_notes_2 ?? '',
    usage_status:
      data?.usage_status ?? UsageStatus.AVAILABLE,
  };

  return initData
}