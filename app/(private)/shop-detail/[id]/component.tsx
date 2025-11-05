'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowBack, CloudUpload, Delete, Search } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, JSX, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SelectElement, TextareaAutosizeElement, TextFieldElement } from 'react-hook-form-mui';

import { IMAGE_TYPES } from '@/app/_config/constants';
import { SESSION_STORAGE_KEYS } from '@/app/_config/sessionStorageKeys';
import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';
import { t_shops } from '@/app/_lib/supabase/tableTypes';
import { getAddress } from '@/app/_lib/utils/getAddress';
import { getAttachmentSizeOver, getMbSize } from '@/app/_lib/utils/getFile';
import { getEditFlag } from '@/app/_lib/utils/utils';
import { AlertType, UsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import ItemBase from '@/app/_ui/components/atoms/itemBase';
import { useDirty } from '@/app/_ui/state/dirty/dirtyContext';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

import { insertShopDetailFetcher, searchShopDetailFetcher, updateShopDetailFetcher } from './_lib/fetcher';
import { ShopDetailFormValues, ShopDetailSchema, shopDeteilResponseData } from './_lib/types';
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const id = (useParams().id as string) ?? '-';
  const editMode = useMemo(() => getEditFlag(id), [id]);

  /* useState
  ------------------------------------------------------------------ */
  const [file, setFile] = useState<File>();
  const [fileName, setFileName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

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
  } = useForm<ShopDetailFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(ShopDetailSchema),
    defaultValues: defalutData,
  });

  /* useQuery
  ------------------------------------------------------------------ */
  const searchShopDetailFetch = async () => {
    const req: ApiRequest<number> = { request: Number(id) };
    return searchShopDetailFetcher(req);
  };

  const {
    data: result,
    isLoading,
    refetch,
  } = useApiQuery<ApiResponse<t_shops>>({
    queryKey: [QUERY_KEYS.SHOP_DETAIL_INIT],
    queryFn: searchShopDetailFetch,
    enabled: editMode,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!editMode) {
      return;
    }
    if (!result) {
      return;
    }
    if (!result.success) {
      openSnackbar(AlertType.ERROR, result.error.message);
      router.push('/shop');
      return;
    }
    else if (result.data) {
      console.log(result);
      const data = result.data;
      const initData: Partial<shopDeteilResponseData> = {
        ...data,
        id: id,
        usage_status: data?.usage_status as UsageStatus,
      };
      if (data.shop_image_file_name) {
        setFileName(data.shop_image_file_name);
      }
      reset(initData);
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

  /* functions - Insert
  ------------------------------------------------------------------ */
  const insertHandler: SubmitHandler<ShopDetailFormValues> = async (data) => {
    insertMutate.mutate(data);
  };

  const insertMutate = useApiMutation({
    mutationFn: async (data: ShopDetailFormValues) => {
      openProcessing();

      const formData = new FormData();
      formData.append('formValues', JSON.stringify(data));

      formData.append('shop_image_file_name', file?.name ?? '');
      if (file) {
        formData.append('shop_image_file_bytesize', file.size.toString());
        formData.append('shop_image_file_data', file);
      }
      return insertShopDetailFetcher(formData) as unknown as ApiResponse<number>;
    },
    onSuccess: (res) => {
      openSnackbar(AlertType.SUCCESS, '店舗情報の登録が完了しました。');
      router.push(`/shop-detail/${res.data}`);
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - Update
  ------------------------------------------------------------------ */
  const updateHandler: SubmitHandler<ShopDetailFormValues> = async (data) => {
    openProcessing();
    updateMutate.mutate(data);
  };

  const updateMutate = useApiMutation({
    mutationFn: async (data: ShopDetailFormValues) => {

      const formData = new FormData();
      formData.append('formValues', JSON.stringify(data));

      if (file) {
        formData.append('shop_image_file_name', file?.name ?? '');
        formData.append('shop_image_file_bytesize', file.size.toString());
        formData.append('shop_image_file_data', file);
      }

      return updateShopDetailFetcher(formData);
    },
    onSuccess: (res) => {
      refetch();
      setFile(undefined);
      openSnackbar(AlertType.SUCCESS, '店舗情報の更新が完了しました。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - 添付ファイル
  ------------------------------------------------------------------ */
  /** ファイル追加発火 */
  const fileUpload = () => {
    console.log('flieUpload click!');
    inputRef.current?.click();
    console.log('あなたのタイプは、' + inputRef.current?.type);
  };

  /** ファイル追加 */
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
        '添付可能なファイルサイズを超過しています。\n添付可能なファイルサイズ：1MB\n添付されたファイルサイズ：' +
        filesize +
        'MB'
      );
      return;
    }
    closeSnackbar();
    setFile(file);
    setFileName(file.name)
  };

  /** ファイル削除 */
  const fileDelete = () => {
    console.log('fileDelete click!');
    setFile(undefined);
    setFileName('')
  };

  // 住所取得
  const getAddressHandler = async () => {
    setAddressLoading(true);
    const postalCode = getValues('shop_postal_code_prefix') + getValues('shop_postal_code_suffix');
    const { prefecture, suburb, city, errorMessage } = await getAddress(postalCode);
    if (errorMessage) {
      setValue('shop_address', '');
      openSnackbar(AlertType.WARNING, errorMessage);
    } else {
      setValue('shop_address', prefecture + city + suburb);
    }
    setAddressLoading(false);
  };


  /** 検索画面に戻る */
  const pageBack = async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.PREVIOUS_PATH, '/shop-detail');
    router.push('/shop');
  };

  /* dirty
  ------------------------------------------------------------------ */
  useEffect(() => {
    setDirty(isDirty);
  }, [isDirty, setDirty]);

  useEffect(() => {
    return () => {
      // 画面離脱時にクエリを無効化・再フェッチ予約する。
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOP_DETAIL_INIT] });
      setDirty(false); // CleanUp
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Box sx={{ m: 3 }}>
          <form onSubmit={handleSubmit(editMode ? updateHandler : insertHandler)} noValidate>
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
                    name="shop_postal_code_prefix"
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
                    name="shop_postal_code_suffix"
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
                  name="shop_address"
                  fullWidth
                />
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
              <ItemBase name={'建物名'} isRequired={1}>
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
                  name="email"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 256 } }}
                />
              </ItemBase>
              <ItemBase name={'店舗イメージ'} isRequired={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {!fileName ? (
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
                      <Typography>{fileName}</Typography>
                      <IconButton onClick={fileDelete}>
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </Box>
              </ItemBase>
              <ItemBase name={'食べログURL'} isRequired={1}>
                <TextFieldElement
                  control={control}
                  size="small"
                  type="url"
                  color={'primary'}
                  name="tabelog_url"
                  placeholder='https://tabelog.com/prefectures/...'
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 256 } }}
                />
              </ItemBase>
              <ItemBase name={'店舗紹介文'} isRequired={1}>
                <TextareaAutosizeElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="shop_description"
                  rows={3}
                  resizeStyle="vertical"
                  fullWidth
                />
              </ItemBase>
              <ItemBase name={'特定商取引法に基づく表記'} isRequired={1}>
                <TextareaAutosizeElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="specified_commercial_transaction_act"
                  rows={6}
                  resizeStyle="vertical"
                  fullWidth
                />
              </ItemBase>
              <ItemBase name={'メモ'} isRequired={1}>
                <TextareaAutosizeElement
                  control={control}
                  size="small"
                  color={'primary'}
                  name="memo"
                  rows={3}
                  resizeStyle="vertical"
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
            </Grid>
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

/** formValues初期値 */
const defalutData: ShopDetailFormValues = {
  id: '-',
  shop_name: '',
  shop_name_kana: '',
  shop_postal_code_prefix: '',
  shop_postal_code_suffix: '',
  shop_address: '',
  shop_area_block_number: '',
  shop_building_name: '',
  tel_no: '',
  email: '',
  tabelog_url: '',
  shop_description: '',
  specified_commercial_transaction_act: '',
  usage_status: UsageStatus.AVAILABLE,
  memo: '',
};
