'use client';
import { CloudUpload, Delete } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ChangeEvent, JSX, useRef, useState } from 'react';

import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { AlertType } from '@/app/_types/enum';
import { ApiResponse } from '@/app/_types/types';
import ItemBase from '@/app/_ui/components/atoms/itemBase';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

import { upsertScheduleFetcher } from './_lib/fetcher';

/** ページ名 */
const pageName = 'スケジュール登録';

/**
 * スケジュール登録Component
 * @returns {JSX.Element} JSX
 */
export const ScheduleRegistrationComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  /* fileUpload */
  const [file, setFile] = useState<File>();
  const [failedRows, setFailedRows] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* functions - Insert
  ------------------------------------------------------------------ */
  const upsertHandler = async () => {
    if (!file) return;
    upsertMutate.mutate({});
  };

  const upsertMutate = useApiMutation({
    mutationFn: async () => {
      openProcessing();
      const formData = new FormData();
      formData.append('csvFile', file!);
      return upsertScheduleFetcher(formData) as unknown as ApiResponse<any>; // ★型をany(Result)で受ける
    },
    onSuccess: (res: ApiResponse<any>) => {
      setFile(undefined);

      // 1. まず型ガードで「処理自体が成功していること」を確定させます
      if (res.success) {
        // ここを通ることで、TypeScriptが res.data の存在を安全だと認識します
        if (res.data && res.data.failedRows && res.data.failedRows.length > 0) {
          setFailedRows(res.data.failedRows);
          openSnackbar(AlertType.WARNING, '一部のデータに重複エラーがあり、登録されませんでした。');
        } else {
          setFailedRows([]);
          openSnackbar(AlertType.SUCCESS, 'スケジュールを登録しました。');
        }
      } else {
        // 2. サーバー側で致命的な例外（システムエラー等）が発生して success: false になった場合
        setFailedRows([]);
        openSnackbar(AlertType.ERROR, res.error?.message || 'スケジュールの登録に失敗しました。');
      }
    },
    onSettled: () => {
      closeProcessing();
    },
  });


  /* functions - 添付ファイル
  ------------------------------------------------------------------ */
  const fileUpload = () => {
    console.log('flieUpload click!');
    inputRef.current?.click();
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('onFileInputChange click!');
    const IMAGE_TYPES = ['text/csv']
    if (!event.target.files) {
      return
    }
    if (!IMAGE_TYPES.includes(event.target.files?.[0].type)) {
      openSnackbar(AlertType.WARNING, 'アップロードできないファイルです。※アップロード可能な拡張子：.csv')
      return
    }
    setFile(event.target.files?.[0]);
  };
  const fileDelete = () => {
    setFile(undefined);
    setFailedRows([]); // ★クリア処理を追加
  };

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
          {/* ★追加: 登録できなかったデータを画面の上部に分かりやすく出力するコンテナ */}
          {failedRows.length > 0 && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fdf2f2', border: '1px solid #f5c2c2', borderRadius: 2 }}>
              <Typography variant="subtitle1" color="error" fontWeight="bold" sx={{ mb: 1 }}>
                ⚠️ 以下のデータは、同一日に別の店舗が既に登録されているため登録できませんでした：
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {failedRows.map((row, idx) => (
                  <Typography component="li" variant="body2" key={idx} color="error.main">
                    {`配達日: ${row.delivery_day} / 会社ID: ${row.t_companies_id} / 店舗ID: ${row.t_shops_id} (${row.menu_name})`}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
          <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} direction="column">
            <ItemBase name={'スケジュールデータ'} isRequired={0}>
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
          </Grid>
          <Grid sx={{ mt: 2 }} size={{ xs: 12 }}>
            <Button fullWidth variant="contained" disabled={file ? false : true} onClick={upsertHandler}>
              登録
            </Button>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};
