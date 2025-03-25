'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Add, CheckBox, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { ja } from 'date-fns/locale/ja';
import { useRouter } from 'next/router';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement, TextFieldElement } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { CompanyDetailFormValues, CompanyDetailSchema } from '@/app/_types/types';
import ItemBase from '@/app/_ui/shared/ItemBase';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { state as stateMockData } from '../../../public/state.json';

/** ページ名 */
const pageName = '会社詳細';

export const CompanyComponent = () => {
  const { openSnackbar } = useSnackBar();

  const userUrl = ''; // TODO: api取得
  const companyId = ''; // TODO: api取得

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<CompanyDetailFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(CompanyDetailSchema),
    defaultValues: {
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
      availabilityFrom: '',
      availabilityTo: '',
      cancelDeadlineDay: '',
      cancelDeadlineHour: '',
      cancelDeadlineMin: '',
      departmentInfo: [],
      orderDeadlineDay: '',
      orderDeadlineHour: '',
      orderDeadlineMin: '',
      employmentTypeInfo: [],
      annotation1: '',
      annotation2: '',
      anyItem1: '',
      anyItem2: '',
    },
  });

  // 登録ハンドラー
  const submitHandler: SubmitHandler<CompanyDetailFormValues> = (data) => {
    console.log(data + '成功してます');
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
                  placeholder="番地"
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
                  placeholder="番地・建物名・階数など"
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
                  placeholder="番地・建物名・階数など"
                  slotProps={{ htmlInput: { maxLength: 128 } }}
                />
              </ItemBase>
              <ItemBase name={'メールアドレス'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
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
                <Grid container>
                  <Grid>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '640px',
                      }}
                    >
                      <TextFieldElement
                        control={control}
                        size="small"
                        color={'primary'}
                        name="departmentInfo"
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 256 } }}
                      />
                      <IconButton>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '640px',
                        mt: 1,
                      }}
                    >
                      <TextFieldElement
                        control={control}
                        size="small"
                        color={'primary'}
                        name="departmentInfo"
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 256 } }}
                      />
                      <IconButton>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid>
                    <Box sx={{ mt: 1 }}>
                      <Button variant="outlined" startIcon={<Add />}>
                        <Typography>追加</Typography>
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </ItemBase>
              <ItemBase name={'雇用種別情報'} isRequired={1}>
                <Grid container>
                  <Grid>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">{'雇用形態名'}</TableCell>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap', maxWidth: '100px' }}>
                              会社清算
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                whiteSpace: 'pre-wrap',
                                fontSize: '0.8rem',
                                maxWidth: '100px',
                              }}
                            >
                              {'クレジットカード'}
                            </TableCell>
                            <TableCell align="center">PayPay</TableCell>
                            <TableCell align="center">会社負担</TableCell>
                            <TableCell align="center"></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell align="center">
                              <TextField size="small"></TextField>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox></Checkbox>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox></Checkbox>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox></Checkbox>
                            </TableCell>
                            <TableCell align="center">
                              <TextField size={'small'} sx={{ width: '80px', textAlign: 'right' }}>
                                600
                              </TextField>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton>
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="center">
                              <TextField size="small"></TextField>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox></Checkbox>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox></Checkbox>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox></Checkbox>
                            </TableCell>
                            <TableCell align="center">
                              <TextField size={'small'} sx={{ width: '80px', textAlign: 'right' }}>
                                600
                              </TextField>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton>
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid>
                    <Box sx={{ mt: 1 }}>
                      <Button variant="outlined" startIcon={<Add />}>
                        <Typography>追加</Typography>
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
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
                    alignItems: 'center',
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                    <TimePicker ampm={false} timeSteps={{ hours: 1, minutes: 15 }} sx={{ width: '160px' }} />
                    <Typography sx={{ mx: 1 }}>{' ～ '}</Typography>
                    <TimePicker ampm={false} timeSteps={{ hours: 1, minutes: 15 }} sx={{ width: '160px' }} />
                  </LocalizationProvider>
                </Box>
              </ItemBase>
              <ItemBase name={'注文期限'} isRequired={0}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
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
                  <Typography sx={{ whiteSpace: 'nowrap' }}>日前</Typography>
                  <SelectElement
                    control={control}
                    size="small"
                    name="orderDeadlineHour"
                    fullWidth
                    options={selectOptions.hours}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Typography>時</Typography>
                  <SelectElement
                    control={control}
                    size="small"
                    name="orderDeadlineMin"
                    fullWidth
                    options={selectOptions.minutes}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Typography>分</Typography>
                </Box>
              </ItemBase>
              <ItemBase name={'キャンセル期限'} isRequired={0}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
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
                  <Typography sx={{ whiteSpace: 'nowrap' }}>日前</Typography>
                  <SelectElement
                    control={control}
                    size="small"
                    name="cancelDeadlineHour"
                    fullWidth
                    options={selectOptions.hours}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Typography>時</Typography>
                  <SelectElement
                    control={control}
                    size="small"
                    name="cancelDeadlineMin"
                    fullWidth
                    options={selectOptions.minutes}
                    sx={{ width: '80px' }}
                  ></SelectElement>
                  <Typography>分</Typography>
                </Box>
              </ItemBase>
            </Grid>
            {/* 登録・更新ボタン */}
            <Grid sx={{ mt: 1 }} size={{ xs: 12 }}>
              <Button fullWidth variant="contained" type={'submit'}>
                登録
              </Button>
            </Grid>
          </form>
        </Box>
        {/* テストが終わったら以下は消します */}
      </Paper>
      <Box sx={{ my: 2 }} />
    </>
  );
};
