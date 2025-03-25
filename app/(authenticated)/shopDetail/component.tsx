'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CloudUpload, Delete } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ChangeEvent, useRef, useState } from 'react';
import { FieldError, SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement, TextFieldElement } from 'react-hook-form-mui';

import { ShopDetailSchema, ShopDetailSchemaType } from '@/app/_types/types';
import ItemBase from '@/app/_ui/shared/ItemBase';

import { state as stateMockData } from '../../../public/state.json';
/** ページ名 */
const pageName = '店舗詳細';
// type Props = {
//   control: Control<SearchFormValues>
//   searchHandler: SubmitHandler<SearchFormValues>
//   clearHandler: MouseEventHandler
//   register: UseFormRegister<SearchFormValues>
//   handleSubmit: UseFormHandleSubmit<SearchFormValues>
//   isDirty: boolean
// }

export const ShopComponent = () => {
  const {
    handleSubmit,
    formState,
    control,
    formState: { errors },
  } = useForm<ShopDetailSchema>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(ShopDetailSchemaType),
    defaultValues: {
      shopId: '0000001',
      shopName: '',
      shopNameKana: '',
      postalCode: '',
      state: '',
      city: '',
      town: '',
      buildingName: '',
      telNumber: '',
      mailAddress: '',
      hyoki: '',
      image: undefined,
      status: '',
      memo: '',
      houseNumber: '',
    },
    // mode: 'onSubmit',
    // reValidateMode: 'onSubmit'
  });
  const searchHandler: SubmitHandler<ShopDetailSchema> = (data) => {
    console.log(data + '成功してます');
  };

  /* fileUpload */
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fileUpload = () => {
    console.log('flieUpload click!');
    inputRef.current?.click();
    console.log('あなたのタイプは、' + inputRef.current?.type);
  };
  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('onFileInputChange click!');
    // TODO:バリデーション(ファイルサイズ・拡張子)
    const IMAGE_TYPES = ['image/jpg', 'image/png'];
    if (!event.target.files) {
      return;
    }
    if (!IMAGE_TYPES.includes(event.target.files?.[0].type)) {
      // TODO:alart or errorMessage
      return;
    }
    setFile(event.target.files?.[0]);
  };
  const fileDelete = () => {
    console.log('fileDelete click!');
    setFile(undefined);
  };

  const stateData = [
    { id: '', label: '未選択' },
    ...stateMockData.map((d: string, index: number) => {
      return { id: index.toString(), label: d };
    }),
  ];

  const errorPrams = (error: FieldError) => {
    console.log('押されているっぽい');
    return error?.message;
  };

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
          <form onSubmit={handleSubmit(searchHandler)}>
            <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} direction="column">
              <ItemBase name={'店舗ID'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="shopId"
                  fullWidth
                  disabled
                  sx={{ backgroundColor: 'lightgray' }}
                  slotProps={{ htmlInput: { maxLength: 64 } }}
                />
              </ItemBase>
              <ItemBase name={'店舗名'} isRequired={0}>
                <TextFieldElement control={control} size="small" color={'primary'} name="shopName" fullWidth />
              </ItemBase>
              <ItemBase name={'店舗名(カナ)'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="shopNameKana"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 256 } }}
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
              <ItemBase name={'電話番号'} isRequired={0}>
                <TextFieldElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="telNumber"
                  slotProps={{ htmlInput: { maxLength: 11 } }}
                  fullWidth
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
              <ItemBase name={'特定商取引法に基づく表記'} isRequired={1}>
                <TextareaAutosizeElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="hyoki"
                  minRows={3}
                  resizeStyle="vertical"
                  fullWidth
                />
              </ItemBase>
              <ItemBase name={'店舗イメージ'} isRequired={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {!file ? (
                    <Button
                      component="label"
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<CloudUpload />}
                      onClick={fileUpload}
                    >
                      ファイルを選択してください
                      <input
                        type="file"
                        onChange={onFileInputChange}
                        style={{
                          clip: 'rect(0 0 0 0)',
                          clipPath: 'inset(50%)',
                          height: 1,
                          overflow: 'hidden',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          whiteSpace: 'nowrap',
                          width: 1,
                        }}
                      />
                    </Button>
                  ) : (
                    <>
                      <Typography>{file?.name}</Typography>
                      <IconButton onClick={fileDelete}>
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </Box>
              </ItemBase>
              <ItemBase name={'ステータス'} isRequired={0}>
                <SelectElement
                  control={control}
                  size="small"
                  name="status"
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
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
              </ItemBase>
            </Grid>
            <Grid sx={{ mt: 1 }} size={{ xs: 12 }}>
              <Button fullWidth variant="contained" type={'submit'}>
                登録
              </Button>
            </Grid>
          </form>
        </Box>
      </Paper>
    </>
  );
};
