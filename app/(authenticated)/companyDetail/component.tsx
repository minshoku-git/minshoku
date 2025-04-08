'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { ja } from 'date-fns/locale/ja';
import { useMemo } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement, TextFieldElement } from 'react-hook-form-mui';
import { TimePickerElement } from 'react-hook-form-mui/date-pickers';

import {
  DepartmentData,
  EmploymentData,
  MOCKDATA_departmentInfo,
  MOCKDATA_employmentInfo,
} from '@/app/_lib/createMockData';
import { AlertType } from '@/app/_types/enum';
import { CompanyDetailFormValues, CompanyDetailSchema } from '@/app/_types/types';
import { DepartmentInput } from '@/app/_ui/shared/departmentInput';
import { EmploymentInput } from '@/app/_ui/shared/employmentInput';
import ItemBase from '@/app/_ui/shared/ItemBase';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { state as stateMockData } from '../../../public/state.json';

/** ページ名 */
const pageName = '会社詳細';

export const CompanyComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const userUrl = ''; // TODO: api取得
  const companyId = ''; // TODO: api取得
  const { openSnackbar } = useSnackBar();

  /* useForm
  ------------------------------------------------------------------ */
  const {
    handleSubmit,
    control,
    setValue,
    formState: { isDirty },
  } = useForm<CompanyDetailFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onSubmit', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(CompanyDetailSchema),
    defaultValues: {
      departmentInfo: MOCKDATA_departmentInfo,
      employmentTypeInfo: MOCKDATA_employmentInfo,
      companyName: '',
      branchName: '',
      postalCode: '',
      state: '',
      city: '',
      town: '',
      houseNumber: '',
      buildingName: '',
      cafeteriaName: '',
      mailAddress: '',
      memo: '',
      location: '',
      availabilityFrom: null,
      availabilityTo: null,
      cancelDeadlineDay: '',
      cancelDeadlineHour: '',
      cancelDeadlineMin: '',
      orderDeadlineDay: '',
      orderDeadlineHour: '',
      orderDeadlineMin: '',
      annotation1: '',
      annotation2: '',
      anyItem1: '',
      anyItem2: '',
    },
  });

  /* useFieldArray 部署情報
  ------------------------------------------------------------------ */
  const {
    fields: fields_dep,
    append: append_dep,
    remove: remove_deb,
  } = useFieldArray({ control: control, name: 'departmentInfo' });

  const addField_dep = () => {
    append_dep({ name: '', id: '', disabled: false });
  };

  // 削除対象の部署
  const deleteDepArray: DepartmentData[] = [];

  const removeField_dep = (index: number) => {
    if (fields_dep[index].id) {
      deleteDepArray.push(fields_dep[index] as DepartmentData);
    }
    remove_deb(index);
    console.log('deleteDepArray:', deleteDepArray);
  };

  /* useFieldArray 雇用種別情報
  ------------------------------------------------------------------ */
  const {
    fields: fields_emp,
    append: append_emp,
    remove: remove_emp,
  } = useFieldArray({ control: control, name: 'employmentTypeInfo' });

  const addField_emp = () => {
    append_emp({
      id: '',
      name: '',
      isCreditCard: false,
      isPayPay: false,
      isDeduction: false,
      burdenAmount: '0',
      disabled: false,
    });
  };

  // 削除対象の雇用種別
  const deleteEmpArray: EmploymentData[] = [];

  const removeField_emp = (index: number) => {
    if (fields_emp[index].id) {
      deleteEmpArray.push(fields_emp[index] as EmploymentData);
    }
    remove_emp(index);
    console.log('deleteEmpArray:', deleteEmpArray);
  };

  /* functions
  ------------------------------------------------------------------ */

  // 登録ハンドラー
  const submitHandler: SubmitHandler<CompanyDetailFormValues> = (data) => {
    console.log('登録データ:', data);
    openSnackbar(AlertType.SUCCESS, '会社情報の登録が完了しました。');
  };

  // "URLと案内文をコピー"
  const message =
    'クリップボードのテストメッセージです。\nクリップボードのテストメッセージです。\nクリップボードのテストメッセージです。';
  const isBrowser = typeof window !== 'undefined';
  const clickboardHandler = async () => {
    if (!isBrowser) return;
    openSnackbar(AlertType.SUCCESS, 'クリップボードにコピーしました。');
    await navigator.clipboard.writeText(message);
  };

  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  // selectBoxの選択肢を生成
  const selectOptions = useMemo(() => {
    const day = selectOptionCreate(10);
    const hours = selectOptionCreate(23);
    const minutes = selectOptionCreate(59);
    return { hours, minutes, day };
  }, []);

  function selectOptionCreate(max: number) {
    const hours = [{ id: '', label: '未選択' }];
    for (let i = 0; i <= max; i++) {
      hours.push({ id: i.toString(), label: i.toString() });
    }
    return hours;
  }

  // 都道府県(モックから取得)
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
      <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
        <Grid container alignItems="center">
          <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ px: 3, py: 2, mb: 0 }}>
            {pageName}
          </Typography>
        </Grid>
        <Divider />
        <Box sx={{ m: 3, mb: 0, display: 'flex' }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={clickboardHandler}>
            URLと案内文をコピーする
          </Button>
        </Box>
        <Box sx={{ m: 3 }}>
          <form onSubmit={handleSubmit(submitHandler)}>
            <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} direction="column">
              <ItemBase name={'ユーザー登録URL'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="userUrl"
                  fullWidth
                  disabled
                  sx={{ backgroundColor: 'lightgray' }}
                  slotProps={{ htmlInput: { maxLength: 64 } }}
                  value={'https://xxxxxxxxxxxxx/login/refact'}
                />
              </ItemBase>
              <ItemBase name={'会社ID'} isRequired={2}>
                <TextField
                  size="small"
                  color={'primary'}
                  name="companyId"
                  fullWidth
                  disabled
                  sx={{ backgroundColor: 'lightgray' }}
                  slotProps={{ htmlInput: { maxLength: 64 } }}
                  value={'0123456789'}
                />
              </ItemBase>
              <ItemBase name={'会社名'} isRequired={0}>
                <TextFieldElement control={control} size="small" color={'primary'} name="companyName" fullWidth />
              </ItemBase>
              <ItemBase name={'支店名'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="branchName"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 256 } }}
                />
              </ItemBase>
              <ItemBase name={'食堂名'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="cafeteriaName"
                  slotProps={{ htmlInput: { maxLength: 7 } }}
                  fullWidth
                />
              </ItemBase>
              <ItemBase name={'郵便番号'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="postalCode"
                  slotProps={{ htmlInput: { maxLength: 7 } }}
                  fullWidth
                />
              </ItemBase>
              <ItemBase name={'住所'} isRequired={0}>
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
                    name="state"
                    label="都道府県"
                    fullWidth
                    options={stateData}
                  ></SelectElement>
                  <SelectElement
                    control={control}
                    size="small"
                    name="city"
                    label="市区"
                    fullWidth
                    options={[
                      { id: '', label: '未選択' },
                      { id: '10', label: '市区1' },
                      { id: '20', label: '市区2' },
                      { id: '30', label: '市区3' },
                    ]}
                  ></SelectElement>
                  <SelectElement
                    control={control}
                    size="small"
                    name="town"
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
              <ItemBase name={'番地'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="houseNumber"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 128 } }}
                />
              </ItemBase>
              <ItemBase name={'建物名'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="buildingName"
                  fullWidth
                  placeholder="建物名・階数など"
                  slotProps={{ htmlInput: { maxLength: 128 } }}
                />
              </ItemBase>
              <ItemBase name={'提供場所'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="location"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 128 } }}
                />
              </ItemBase>
              <ItemBase name={'メールアドレス'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  type="email"
                  name="mailAddress"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 256 } }}
                />
              </ItemBase>
              <ItemBase name={'連絡先・メモ'} isRequired={1}>
                <TextareaAutosizeElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="memo"
                  minRows={3}
                  resizeStyle="vertical"
                  fullWidth
                />
              </ItemBase>
              <ItemBase name={'部署情報'} isRequired={1}>
                <DepartmentInput
                  control={control}
                  fields={fields_dep}
                  addField={addField_dep}
                  removeField={removeField_dep}
                  setValue={setValue}
                />
              </ItemBase>
              <ItemBase name={'雇用種別情報'} isRequired={1}>
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
                    size="small"
                    color={'primary'}
                    name="anyItem1"
                    label="項目名"
                    sx={{ width: '640px', mb: 1 }}
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="annotation1"
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
                    color={'primary'}
                    name="anyItem2"
                    label="項目名"
                    sx={{ width: '640px', mb: 1 }}
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="annotation2"
                    label="注釈"
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
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                    <TimePickerElement
                      control={control}
                      name={'availabilityFrom'}
                      ampm={false}
                      timeSteps={{ hours: 1, minutes: 15 }}
                      sx={TimePickerStyle}
                      slotProps={{ textField: { size: 'small' }, inputAdornment: {} }}
                    />
                    <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mx: 1 }}>{'～'}</Typography>
                    </Box>{' '}
                    <TimePickerElement
                      control={control}
                      name={'availabilityTo'}
                      ampm={false}
                      timeSteps={{ hours: 1, minutes: 15 }}
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
                    name="orderDeadlineDay"
                    fullWidth
                    options={selectOptions.day}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ whiteSpace: 'nowrap' }}>{'日前'}</Typography>
                  </Box>
                  <SelectElement
                    control={control}
                    size="small"
                    name="orderDeadlineHour"
                    fullWidth
                    options={selectOptions.hours}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ whiteSpace: 'nowrap' }}>{'時'}</Typography>
                  </Box>
                  <SelectElement
                    control={control}
                    size="small"
                    name="orderDeadlineMin"
                    fullWidth
                    options={selectOptions.minutes}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ whiteSpace: 'nowrap' }}>{'分'}</Typography>
                  </Box>
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
                    name="cancelDeadlineDay"
                    fullWidth
                    options={selectOptions.day}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ whiteSpace: 'nowrap' }}>{'日前'}</Typography>
                  </Box>
                  <SelectElement
                    control={control}
                    size="small"
                    name="cancelDeadlineHour"
                    fullWidth
                    options={selectOptions.hours}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ whiteSpace: 'nowrap' }}>{'時'}</Typography>
                  </Box>
                  <SelectElement
                    control={control}
                    size="small"
                    name="cancelDeadlineMin"
                    fullWidth
                    options={selectOptions.minutes}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ whiteSpace: 'nowrap' }}>{'分'}</Typography>
                  </Box>
                </Box>
              </ItemBase>
            </Grid>
            {/* 登録・更新ボタン */}
            <Grid sx={{ mt: 2 }} size={{ xs: 12 }}>
              <Button fullWidth variant="contained" type="submit">
                登録
              </Button>
            </Grid>
          </form>
        </Box>
      </Paper>
    </>
  );
};

//
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
