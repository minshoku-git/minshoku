'use client';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';

import { MockDataCreate_ScheduleResult } from '@/app/_lib/mockDataCreate';
import { ScheduleSearchFormValues } from '@/app/_types/types';
import ItemBase from '@/app/_ui/shared/ItemBase';

import ScheduleResult from './parts/scheduleResult';

/** ページ名 */
const pageName: string = 'スケジュール一覧';
const header: Array<string> = ['配達日', '会社名', '店舗名', 'メニュー名', '食数', 'アレルギー'];

export const ScheduleComponent = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const { reset, control } = useForm<ScheduleSearchFormValues>({
    defaultValues: {
      deliveryFrom: '',
      deliveryTo: '',
      companyName: '',
      branchName: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // 配達日
  const [dateFrom, setDateFrom] = useState<Date | null>(new Date());
  const [dateTo, setDateTo] = useState<Date | null>(new Date());

  // 先月
  const onAfterTodayClick = () => {
    setDateFrom(new Date());
    setDateTo(null);
  };

  // 今日
  const onTodayClick = () => {
    setDateFrom(new Date());
    setDateTo(new Date());
  };

  // 明日
  const onTomorrowClick = () => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), parseInt(('00' + today.getDate()).slice(-2)) + 1);
    setDateFrom(tomorrow);
    setDateTo(tomorrow);
  };

  // 昨日
  const onYesterdayClick = () => {
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), parseInt(('00' + today.getDate()).slice(-2)) - 1);
    setDateFrom(yesterday);
    setDateTo(yesterday);
  };

  // 検索ハンドラ
  const searchHandler: SubmitHandler<ScheduleSearchFormValues> = (data) => {
    console.log('addHandler click!!');
  };

  // リセット
  const onResetClick = () => {
    reset();
    setDateFrom(new Date());
    setDateTo(new Date());
  };

  // 明細行リンクハンドラ
  const linkHandler = (id: string) => {
    router.push('/scheduleDetail');
  };

  // MockData
  const result = MockDataCreate_ScheduleResult();

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
          <FormContainer onSuccess={searchHandler}>
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
                    alignItems: 'center',
                    width: '640px',
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                    <DatePicker name={'dateFrom'} value={dateFrom} sx={{ minWidth: '150px' }} />
                    <Typography sx={{ mx: 1 }}>{' ～ '}</Typography>
                    <DatePicker name={'dateTo'} value={dateTo} sx={{ minWidth: '150px' }} />
                  </LocalizationProvider>
                  <Button
                    onClick={onAfterTodayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    本日以降
                  </Button>
                  <Button
                    onClick={onTodayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    今日
                  </Button>
                  <Button
                    onClick={onYesterdayClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 0.5,
                      px: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    昨日
                  </Button>
                  <Button
                    onClick={onTomorrowClick}
                    sx={{
                      minWidth: 'auto',
                      ml: 0.5,
                      px: 1,
                      whiteSpace: 'nowrap',
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
                  <TextFieldElement control={control} size="small" color={'primary'} name="branchName" fullWidth />
                </Box>
              </ItemBase>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                onClick={onResetClick}
                sx={{
                  minWidth: 'auto',
                  ml: 'auto',
                  px: 1,
                  whiteSpace: 'nowrap',
                  textDecoration: 'underline',
                }}
              >
                検索項目をリセット
              </Button>
            </Grid>
            <Grid sx={{ mt: 1 }} size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setIsSearch(!isSearch);
                }}
              >
                検索
              </Button>
            </Grid>
            {isSearch && result && (
              <>
                <Divider sx={{ my: 3 }} />
                <ScheduleResult header={header} result={result} />
              </>
            )}
          </FormContainer>
        </Box>
      </Paper>
    </>
  );
};
