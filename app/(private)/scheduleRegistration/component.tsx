'use client';
import { CloudUpload, Delete } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ChangeEvent, JSX, useRef, useState } from 'react';

import { AlertType } from '@/app/_types/enum';
import ItemBase from '@/app/_ui/_shared/itemBase';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

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

  /* useState
  ------------------------------------------------------------------ */
  /* fileUpload */
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* functions
  ------------------------------------------------------------------ */
  const registerHandler = () => {
    openSnackbar(AlertType.SUCCESS, 'スケジュールを登録しました。');
    setFile(undefined);
  };

  /* functions - 添付ファイル
  ------------------------------------------------------------------ */
  const fileUpload = () => {
    console.log('flieUpload click!');
    inputRef.current?.click();
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('onFileInputChange click!');
    // // TODO:バリデーション(ファイルサイズ・拡張子)
    // const IMAGE_TYPES = ['text/csv']
    // if (!event.target.files) {
    //   return
    // }
    // if (!IMAGE_TYPES.includes(event.target.files?.[0].type)) {
    //   openSnackbar(AlertType.WARNING, 'アップロードできないファイルです。※アップロード可能な拡張子：.csv')
    //   // TODO:alart or errorMessage
    //   return
    // }
    setFile(event.target.files?.[0]);
  };
  const fileDelete = () => {
    console.log('fileDelete click!');
    setFile(undefined);
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
            <Button fullWidth variant="contained" disabled={file ? false : true} onClick={registerHandler}>
              登録
            </Button>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};
