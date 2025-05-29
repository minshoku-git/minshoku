'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CloudUpload, Delete } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, JSX, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement, TextFieldElement } from 'react-hook-form-mui';

import { searchShopDetail, insertShopDetail, updateShopDetail } from '@/app/_actions/actions';
import { getAttachmentSizeOver, getMbSize } from '@/app/_lib/getFile';
import { getEditFlag } from '@/app/_lib/utill';
import { IMAGE_TYPES } from '@/app/_types/constants';
import { AlertType, UsageStatus } from '@/app/_types/enum';
import ItemBase from '@/app/_ui/_shared/itemBase';
import { useDirty } from '@/app/_ui/dirty/dartyContext';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { state as stateMockData } from '../../../../public/state.json';
import { ShopDetailFormValues, ShopDetailSchema } from './_lib/types';

/** ページ名 */
const pageName = '店舗詳細';

/**
 * 店舗詳細Component
 * @returns {JSX.Element} JSX
 */
export const ShopComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const { openSnackbar, closeSnackbar } = useSnackBar();
  const { setDirty } = useDirty();
  const { openProcessing, closeProcessing } = useProcessing();
  const router = useRouter();
  const params = useParams();
  const id = (params.id as string) ?? '-';

  /* useState
  ------------------------------------------------------------------ */
  const editMode = useMemo(() => getEditFlag(id), [id]);
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  /* useForm
  ------------------------------------------------------------------ */
  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = useForm<ShopDetailFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(ShopDetailSchema),
    defaultValues: defalutData,
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
      openProcessing()
      const data = (await searchShopDetail({ request: Number(id) })).data;
      if (!data?.id) {
        openSnackbar(
          AlertType.ERROR,
          '店舗情報の取得に失敗しました。再度お試しください。'
        );
        router.push('/shop');
        return;
      }
      const initData: Partial<ShopDetailFormValues> = {
        ...data,
        id: id,
        shop_image: undefined,
        usage_status: data?.usage_status,
      };
      reset(initData);
    } catch (error) {
      console.error('取得失敗:', error);
    } finally {
      setDataLoaded(true);
      closeProcessing();
    }
  };

  /* functions
  ------------------------------------------------------------------ */
  /* 新規登録ハンドラー */
  const insertHandler: SubmitHandler<ShopDetailFormValues> = async (data) => {
    console.log('登録データ:', data);
    openProcessing();
    const res = await insertShopDetail({ request: data });
    if (res.error) {
      openSnackbar(AlertType.ERROR, '店舗情報の新規登録に失敗しました。再度お試しください。' + res.error);
    } else {
      openSnackbar(AlertType.SUCCESS, '店舗情報の登録が完了しました。');
      router.push(`/shopDetail/${res.data}`);
    }
    closeProcessing();
  };

  /* 更新ハンドラー */
  const updateHandler: SubmitHandler<ShopDetailFormValues> = async (data) => {
    console.log('更新データ:', data);
    const res = await updateShopDetail({ request: data });
    if (res.error) {
      openSnackbar(AlertType.ERROR, '会社情報の更新に失敗しました。再度お試しください。' + res.error);
    } else {
      await getInit();
      window.scrollTo(0, 0)
      openSnackbar(AlertType.SUCCESS, '会社情報の更新が完了しました。');
    }
  };

  /* functions - 添付ファイル
  ------------------------------------------------------------------ */

  /* ファイル追加発火 */
  const fileUpload = () => {
    console.log('flieUpload click!');
    inputRef.current?.click();
    console.log('あなたのタイプは、' + inputRef.current?.type);
  };

  /* ファイル追加 */
  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!IMAGE_TYPES.includes(file.type)) {
      openSnackbar(AlertType.WARNING, '添付可能な拡張子のファイルではありません。\n添付可能な拡張子：png, jpg, jpeg');
      return;
    }
    const filesize = getMbSize(file.size);
    if (getAttachmentSizeOver(filesize)) {
      openSnackbar(
        AlertType.WARNING,
        '添付可能なファイルサイズを超過しています。\n添付可能なファイルサイズ：20MB\n添付されたファイルサイズ：' +
        filesize +
        'MB'
      );
      return;
    }
    closeSnackbar();
    setFile(file);
  };

  /* ファイル削除 */
  const fileDelete = () => {
    console.log('fileDelete click!');
    setFile(undefined);
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

  /* mock ※のちすて
  ------------------------------------------------------------------ */
  const stateData = [
    { id: '', label: '未選択' },
    ...stateMockData.map((d: string, index: number) => {
      return { id: index.toString(), label: d };
    }),
  ];

  /* JSX.Element
  ------------------------------------------------------------------ */
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
          {dataLoaded && (
            <form onSubmit={handleSubmit(editMode ? updateHandler : insertHandler)}>
              <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} direction="column">
                {editMode && (
                  <ItemBase name={'店舗ID'} isRequired={2}>
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
                )}
                <ItemBase name={'店舗名'} isRequired={0}>
                  <TextFieldElement control={control} size="small" color={'primary'} name="shop_name" fullWidth />
                </ItemBase>
                <ItemBase name={'店舗名(カナ)'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="shop_name_kana"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 256 } }}
                  />
                </ItemBase>
                <ItemBase name={'郵便番号'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="shop_post_code"
                    placeholder="半角数字7桁"
                    slotProps={{ htmlInput: { maxLength: 7 } }}
                    fullWidth
                  />
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
                      name="shop_prefectures"
                      label="都道府県"
                      fullWidth
                      options={stateData}
                    ></SelectElement>
                    <SelectElement
                      control={control}
                      size="small"
                      name="shop_municipalities"
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
                      name="shop_town_area"
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
                    name="shop_area_block_number"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                </ItemBase>
                <ItemBase name={'建物名'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="shop_building_name"
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
                    name="tel_no"
                    slotProps={{ htmlInput: { maxLength: 11 } }}
                    fullWidth
                  />
                </ItemBase>
                <ItemBase name={'メールアドレス'} isRequired={0}>
                  <TextFieldElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="mailaddress"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 256 } }}
                  />
                </ItemBase>
                <ItemBase name={'特定商取引法に基づく表記'} isRequired={1}>
                  <TextareaAutosizeElement
                    control={control}
                    size="small"
                    color={'primary'}
                    name="specified_commercial_transaction_act"
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
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 500 } }}
                  />
                </ItemBase>
              </Grid>
              <Grid sx={{ mt: 2 }} size={{ xs: 12 }}>
                <Button fullWidth variant="contained" type="submit">
                  {editMode ? '更新' : '登録'}
                </Button>
              </Grid>
            </form>)}
        </Box>
      </Paper>
    </>
  );
};

/** formValues初期値 */
const defalutData: ShopDetailFormValues = {
  id: '-',
  shop_name: '',
  shop_name_kana: '',
  shop_post_code: '',
  shop_prefectures: '',
  shop_municipalities: '',
  shop_town_area: '',
  shop_building_name: '',
  tel_no: '',
  mailaddress: '',
  specified_commercial_transaction_act: '',
  shop_image: undefined,
  usage_status: UsageStatus.AVAILABLE,
  memo: '',
  shop_area_block_number: '',
};
