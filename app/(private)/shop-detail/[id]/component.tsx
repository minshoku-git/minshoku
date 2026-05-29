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
import { getAddress } from '@/app/_lib/utils/getAddress';
import { getAttachmentSizeOver, getMbSize } from '@/app/_lib/utils/getFile';
import { getEditFlag } from '@/app/_lib/utils/utils';
import { AlertType, UsageStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import ItemBase from '@/app/_ui/components/atoms/itemBase';
import DirtyCheck from '@/app/_ui/state/dirty/dirty';
import { useDirty } from '@/app/_ui/state/dirty/dirtyContext';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

import { insertShopDetailFetcher, searchShopDetailFetcher, updateShopDetailFetcher } from './_lib/fetcher';
import { ShopDetailFormValues, ShopDetailInitValues, ShopDetailSchema, shopDeteilResponseData } from './_lib/types';

const pageName = '店舗詳細';

export const ShopComponent = (): JSX.Element => {
  const { openSnackbar, closeSnackbar } = useSnackBar();
  const { setDirty } = useDirty();
  const { confirmNavigation } = DirtyCheck();
  const { openProcessing, closeProcessing } = useProcessing();
  const queryClient = useQueryClient();
  const router = useRouter();
  const id = (useParams().id as string) ?? '-';
  const editMode = useMemo(() => getEditFlag(id), [id]);

  // 【追加】保存成功後にリフェッチが完了するまでの間、警告を抑制するためのフラグ
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const [file, setFile] = useState<File>();
  const [fileName, setFileName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [addressLoading, setAddressLoading] = useState<boolean>(false);

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

  const searchShopDetailFetch = async () => {
    const req: ApiRequest<ShopDetailInitValues> = { request: { id: Number(id) } };
    return searchShopDetailFetcher(req);
  };

  const { data, isLoading, refetch } = useApiQuery<shopDeteilResponseData>({
    queryKey: [QUERY_KEYS.SHOP_DETAIL_INIT, id],
    queryFn: searchShopDetailFetch,
    enabled: editMode,
  });

  /* useEffect - データ初期化
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!editMode || !data) return;

    const req: Partial<shopDeteilResponseData> = {
      ...data,
      id: id,
      usage_status: data?.usage_status as UsageStatus,
    };
    const { shop_image_file_name, shop_image_url, ...initData } = req;
    if (shop_image_file_name) {
      setFileName(shop_image_file_name);
    }
    reset(initData);

    // 最新データのロードとフォームリセットが終わったのでロック解除
    setIsSaved(false);
  }, [data, editMode, id, reset]);

  useEffect(() => {
    if (isLoading) openProcessing();
    else closeProcessing();
  }, [isLoading, openProcessing, closeProcessing]);

  /* Mutation - Insert / Update
  ------------------------------------------------------------------ */
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
      setIsSaved(true); // 保存成功フラグを立てて離脱警告を一時ロック
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOP_SEARCH_RESULT] });
      openSnackbar(AlertType.SUCCESS, '店舗情報の登録が完了しました。');
      router.push(`/shop-detail/${res.data}`);
    },
    onSettled: () => closeProcessing(),
  });

  const updateMutate = useApiMutation({
    mutationFn: async (data: ShopDetailFormValues) => {
      const formData = new FormData();
      formData.append('formValues', JSON.stringify({ ...data, id: id }));
      formData.append('shop_image_file_name', fileName);
      if (file) {
        formData.append('shop_image_file_name', file?.name ?? '');
        formData.append('shop_image_file_bytesize', file.size.toString());
        formData.append('shop_image_file_data', file);
      }
      return updateShopDetailFetcher(formData);
    },
    onSuccess: () => {
      setIsSaved(true); // 保存成功フラグを立てる
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOP_SEARCH_RESULT] });
      refetch();
      setFile(undefined);
      openSnackbar(AlertType.SUCCESS, '店舗情報の更新が完了しました。');
    },
    onSettled: () => closeProcessing(),
  });

  const insertHandler: SubmitHandler<ShopDetailFormValues> = (data) => insertMutate.mutate(data);
  const updateHandler: SubmitHandler<ShopDetailFormValues> = (data) => updateMutate.mutate(data);

  /* ファイル・住所関連
  ------------------------------------------------------------------ */
  const fileUpload = () => inputRef.current?.click();

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      openSnackbar(AlertType.WARNING, '添付可能な形式ではありません。');
      return;
    }
    const filesize = getMbSize(file.size);
    if (getAttachmentSizeOver(filesize)) {
      openSnackbar(AlertType.WARNING, `サイズ超過: ${filesize}MB`);
      return;
    }
    closeSnackbar();
    setFile(file);
    setFileName(file.name);
  };

  const fileDelete = () => {
    setFile(undefined);
    setFileName('');
  };

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

  const pageBack = async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.PREVIOUS_PATH, '/shop-detail');
    confirmNavigation('/shop');
  };

  /* 離脱監視
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (isSaved) {
      setDirty(false); // 保存成功時は強制的に警告を出さない
    } else {
      setDirty(isDirty);
    }
  }, [isDirty, isSaved, setDirty]);

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOP_DETAIL_INIT] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOP_SEARCH_RESULT] });
      setDirty(false);
    };
  }, [queryClient, setDirty]);

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
      <Grid container alignItems="center">
        <Typography component="h2" variant="h6" color="primary" sx={{ px: 3, py: 2, mb: 0 }}>
          {pageName}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {editMode && (
          <Button sx={{ mr: 3 }} variant="outlined" startIcon={<ArrowBack />} onClick={pageBack}>
            戻る
          </Button>
        )}
      </Grid>
      <Divider />
      <Box sx={{ m: 3 }}>
        <form noValidate onSubmit={handleSubmit(editMode ? updateHandler : insertHandler)}>
          <Grid container rowSpacing={2} columnSpacing={3} direction="column">
            {editMode && (
              <ItemBase name="店舗ID" isRequired={2}>
                <TextFieldElement control={control} size="small" name="id" fullWidth disabled sx={{ backgroundColor: 'lightgray' }} />
              </ItemBase>
            )}
            <ItemBase name="店舗名" isRequired={0}>
              <TextFieldElement control={control} size="small" name="shop_name" fullWidth />
            </ItemBase>
            <ItemBase name="店舗名(カナ)" isRequired={0}>
              <TextFieldElement control={control} size="small" name="shop_name_kana" fullWidth />
            </ItemBase>
            <ItemBase name="郵便番号" isRequired={0}>
              <Box sx={{ display: 'flex', alignItems: 'start', width: '640px' }} gap={2}>
                <TextFieldElement control={control} size="small" name="shop_postal_code_prefix" sx={{ width: '80px' }} />
                <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}><Typography>-</Typography></Box>
                <TextFieldElement control={control} size="small" name="shop_postal_code_suffix" sx={{ width: '80px' }} />
                <Button variant="outlined" loading={addressLoading} onClick={getAddressHandler}>住所検索</Button>
              </Box>
            </ItemBase>
            <ItemBase name="住所" isRequired={0}><TextFieldElement control={control} size="small" name="shop_address" fullWidth /></ItemBase>
            <ItemBase name="番地" isRequired={0}><TextFieldElement control={control} size="small" name="shop_area_block_number" fullWidth /></ItemBase>
            <ItemBase name="建物名" isRequired={1}><TextFieldElement control={control} size="small" name="shop_building_name" fullWidth /></ItemBase>
            <ItemBase name="電話番号" isRequired={0}><TextFieldElement control={control} size="small" name="tel_no" fullWidth /></ItemBase>
            <ItemBase name="メールアドレス" isRequired={0}><TextFieldElement control={control} size="small" name="email" fullWidth /></ItemBase>
            <ItemBase name="店舗イメージ" isRequired={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {!fileName ? (
                  <Button component="label" variant="contained" startIcon={<CloudUpload />} onClick={fileUpload}>
                    ファイルを選択してください
                    <input type="file" ref={inputRef} onChange={onFileInputChange} hidden />
                  </Button>
                ) : (
                  <>
                    <Typography>{fileName}</Typography>
                    <IconButton onClick={fileDelete}><Delete /></IconButton>
                  </>
                )}
              </Box>
            </ItemBase>
            <ItemBase name="食べログURL" isRequired={1}><TextFieldElement control={control} size="small" name="tabelog_url" fullWidth /></ItemBase>
            <ItemBase name="店舗紹介文" isRequired={1}><TextareaAutosizeElement control={control} size="small" name="shop_description" rows={3} fullWidth /></ItemBase>
            <ItemBase name="特定商取引法に基づく表記" isRequired={1}><TextareaAutosizeElement control={control} size="small" name="specified_commercial_transaction_act" rows={6} fullWidth /></ItemBase>
            <ItemBase name="メモ" isRequired={1}><TextareaAutosizeElement control={control} size="small" name="memo" rows={3} fullWidth /></ItemBase>
            <ItemBase name="利用ステータス" isRequired={0}>
              <SelectElement control={control} size="small" name="usage_status" fullWidth options={[{ id: UsageStatus.AVAILABLE, label: '利用可能' }, { id: UsageStatus.DEACTIVATION, label: '利用停止' }]} />
            </ItemBase>
          </Grid>
          <Grid sx={{ mt: 2 }} size={12}>
            <Button fullWidth variant="contained" type="submit">{editMode ? '更新' : '登録'}</Button>
          </Grid>
        </form>
      </Box>
    </Paper>
  );
};

const defalutData: ShopDetailFormValues = {
  id: '-', shop_name: '', shop_name_kana: '', shop_postal_code_prefix: '', shop_postal_code_suffix: '', shop_address: '', shop_area_block_number: '', shop_building_name: '', tel_no: '', email: '', tabelog_url: '', shop_description: '', specified_commercial_transaction_act: '', usage_status: UsageStatus.AVAILABLE, memo: '',
};