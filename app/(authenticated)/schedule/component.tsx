'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { MockDataCreate_ScheduleResult } from '@/app/_lib/createMockData';
import { getToday, getTomorrow, getYesterday } from '@/app/_lib/getDateTime';
import { ScheduleSearchFormValues, ScheduleSearchSchema } from '@/app/_types/types';
import ItemBase from '@/app/_ui/_shared/itemBase';

import ScheduleResult from './parts/scheduleResult';

/** ページ名 */
const pageName: string = 'スケジュール一覧';
/** ヘッダー */
const header: Array<string> = ['配達日', '会社名', '店舗名', 'メニュー名', '食数', 'アレルギー'];

/**
 * スケジュール一覧Component
 */
export const ScheduleComponent = () => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();

  /* useState
  ------------------------------------------------------------------ */
  const [isSearch, setIsSearch] = useState(false); // 検索状態

  /* useForm
  ------------------------------------------------------------------ */
  const { reset, control, setValue, handleSubmit } = useForm<ScheduleSearchFormValues>({
    mode: 'onSubmit', // 初回validation時を検索ボタンが押されたタイミングに設定
    reValidateMode: 'onBlur', // 送信ボタンが押され、バリデーションに引っかかった後は、常に入力値のフォーカスが外れた際にバリデーションが走る
    resolver: zodResolver(ScheduleSearchSchema),
    defaultValues: {
      deliveryFrom: getToday(),
      deliveryTo: getToday(),
      companyName: '',
      shopName: '',
    },
  });

  /* handler
  ------------------------------------------------------------------ */
  /** 日付設定（本日以降）ハンドラ */
  const onAfterTodayClick = () => {
    setValue('deliveryFrom', getToday());
    setValue('deliveryTo', null);
  };

  /** 日付設定（本日）ハンドラ */
  const onTodayClick = () => {
    setValue('deliveryFrom', getToday());
    setValue('deliveryTo', getToday());
  };

  /** 日付設定（明日）ハンドラ */
  const onTomorrowClick = () => {
    setValue('deliveryFrom', getTomorrow());
    setValue('deliveryTo', getTomorrow());
  };

  /** 日付設定（昨日）ハンドラ */
  const onYesterdayClick = () => {
    setValue('deliveryFrom', getYesterday());
    setValue('deliveryTo', getYesterday());
  };

  /** 検索条件リセットハンドラ */
  const onResetClick = () => {
    reset();
    setValue('deliveryFrom', getToday());
    setValue('deliveryTo', getToday());
  };

  /** 検索ハンドラ */
  const searchHandler: SubmitHandler<ScheduleSearchFormValues> = (data) => {
    console.log('addHandler click!!');
    setIsSearch(!isSearch);
  };

  /** 明細行リンクハンドラ */
  const linkHandler = (id: string) => {
    router.push('/scheduleDetail');
  };

  /* MockData ※のちすて
  ------------------------------------------------------------------ */
  const result = MockDataCreate_ScheduleResult();

  /* DOM
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
          <form onSubmit={handleSubmit(searchHandler)}>
            <Grid
              container
              rowSpacing={2}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
              direction="column"
              sx={{ alignContent: 'center' }}
            >
              <ItemBase name={'配達日'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    width: '640px',
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                    <DatePickerElement
                      control={control}
                      name={'deliveryFrom'}
                      sx={{
                        minWidth: '150px',
                        '& .MuiInputBase-root': {
                          height: '40px',
                          textAlign: 'center',
                          padding: '0 15px',
                        },
                        '& input': {
                          padding: '0',
                        },
                      }}
                    />
                    <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mx: 1 }}>{'～'}</Typography>
                    </Box>
                    <DatePickerElement
                      control={control}
                      name={'deliveryTo'}
                      sx={{
                        minWidth: '150px',
                        '& .MuiInputBase-root': {
                          height: '40px',
                          textAlign: 'center',
                          verticalAlign: 'center',
                          padding: '0 15px',
                        },
                        '& input': {
                          padding: '0',
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <Button
                    onClick={onAfterTodayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
                      h: 40,
                    }}
                  >
                    本日以降
                  </Button>
                  <Button
                    onClick={onYesterdayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 0.5,
                      px: 1,
                      whiteSpace: 'nowrap',
                      h: 40,
                    }}
                  >
                    昨日
                  </Button>
                  <Button
                    onClick={onTodayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
                      h: 40,
                    }}
                  >
                    本日
                  </Button>
                  <Button
                    onClick={onTomorrowClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 0.5,
                      px: 1,
                      whiteSpace: 'nowrap',
                      h: 40,
                    }}
                  >
                    明日
                  </Button>
                </Box>
              </ItemBase>
              <ItemBase name={'会社名'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <TextFieldElement control={control} size="small" color={'primary'} name="companyName" fullWidth />
                </Box>
              </ItemBase>
              <ItemBase name={'店舗名'} isRequired={2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <TextFieldElement control={control} size="small" color={'primary'} name="shopName" fullWidth />
                </Box>
              </ItemBase>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                onClick={onResetClick}
                sx={{
                  minWidth: 'auto',
                  ml: 'auto',
                  mt: 1,
                  whiteSpace: 'nowrap',
                  textDecoration: 'underline',
                }}
              >
                検索項目をリセット
              </Button>
            </Grid>
            <Grid sx={{ mt: 1 }} size={{ xs: 12 }}>
              <Button fullWidth variant="contained" type="submit">
                検索
              </Button>
            </Grid>
          </form>
          {isSearch && result && (
            <>
              <Divider sx={{ my: 3 }} />
              <ScheduleResult header={header} result={result} />
            </>
          )}
        </Box>
      </Paper>
    </>
  );
};
