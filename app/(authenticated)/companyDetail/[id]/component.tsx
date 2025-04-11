'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from '@mui/icons-material';
import { Box, Button, Divider, FormControlLabel, Paper, Switch, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { ja } from 'date-fns/locale/ja';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm, useWatch } from 'react-hook-form';
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
import { HYPHEN } from '@/app/_types/values';
import { DepartmentInput } from '@/app/_ui/_shared/departmentInput';
import { EmploymentInput } from '@/app/_ui/_shared/employmentInput';
import ItemBase from '@/app/_ui/_shared/itemBase';
import { useDirty } from '@/app/_ui/dirty/dartyContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { state as stateMockData } from '../../../../public/state.json';

/** ページ名 */
const pageName = '会社詳細';

export const CompanyComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const params = useParams();

  const { openSnackbar, closeSnackbar } = useSnackBar();
  const { setDirty } = useDirty();

  /* useState
  ------------------------------------------------------------------ */
  const [editMode, setEditMode] = useState<boolean>(HYPHEN() !== params.id);

  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty },
  } = useForm<CompanyDetailFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(CompanyDetailSchema),
    defaultValues: {
      // departmentInfo: MOCKDATA_departmentInfo,
      // employmentTypeInfo: MOCKDATA_employmentInfo,
      departmentInfo: [{ name: '', id: '', disabled: false }],
      employmentTypeInfo: [
        {
          id: '',
          name: '',
          isCreditCard: false,
          isPayPay: false,
          isDeduction: false,
          burdenAmount: '0',
          disabled: false,
        },
      ],
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
      anyItem1: '',
      anyItem2: '',
      annotation1: '',
      annotation2: '',
      otameshi: '',
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
    console.log('登録データ:', data.city);
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
    setEditMode(e.target.checked);
  };

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

  // 郵便番号検索のおためし
  const kensaku = () => {
    console.log('やほー！');

    const postcode = getValues('postalCode');
    if (postcode.length !== 7) {
      closeSnackbar();
      openSnackbar(AlertType.WARNING, '住所を取得できませんでした。番号をお確かめの上、再度お試しください。');
      return;
    }

    const url = `https://postcode.teraren.com/postcodes/${postcode}.json`;

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const prefecture = json.prefecture;
        const city = json.city;
        const suburb = json.suburb;
        const address = prefecture + city + suburb;
        console.log('address:' + address);
        if (!address) {
          setValue('otameshi', '');
          openSnackbar(AlertType.WARNING, '住所を取得できませんでした。番号をお確かめの上、再度お試しください。');
        }
        setValue('otameshi', address);
      })
      .catch((error) => {
        setValue('otameshi', '');
        openSnackbar(AlertType.WARNING, '住所を取得できませんでした。番号をお確かめの上、再度お試しください。');
        console.error(error);
      });
  };

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
          <Box sx={{ flexGrow: 1 }} />

          <FormControlLabel
            value="end"
            control={
              <Switch
                color="primary"
                onChange={(e) => {
                  modeChangeHandler(e);
                }}
                checked={editMode}
              />
            }
            label="EditMode"
            labelPlacement="end"
          />
        </Grid>
        <Divider />
        {editMode && (
          <Box sx={{ m: 3, mb: 0, display: 'flex' }}>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" onClick={clickboardHandler}>
              URLと案内文をコピーする
            </Button>
          </Box>
        )}
        <Box sx={{ m: 3 }}>
          <form onSubmit={handleSubmit(submitHandler)}>
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
                </>
              )}
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
                    size="small"
                    color={'primary'}
                    name="postalCode"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 7 } }}
                  />
                  <Button
                    variant="outlined"
                    sx={{ height: '40px', px: 3, textWrap: 'nowrap' }}
                    startIcon={<Search />}
                    onClick={() => {
                      kensaku();
                    }}
                  >
                    住所検索
                  </Button>
                </Box>
              </ItemBase>
              <ItemBase name={'住所(おためし)'} isRequired={0}>
                <TextFieldElement control={control} size="small" color={'primary'} name="otameshi" fullWidth />
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
                      { id: '', label: '未選択', value: '未選択' },
                      { id: '10', label: '市区1', value: '市区1' },
                      { id: '20', label: '市区2', value: '市区2' },
                      { id: '30', label: '市区3', value: '市区3' },
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
                {editMode ? '更新' : '登録'}
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
