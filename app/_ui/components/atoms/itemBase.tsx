import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { JSX } from 'react';

import OptionalMark from './optionalMark';
import RequiredMark from './requiredMark';

/** ItemBaseコンポーネントプロパティ */
type ItemBaseProps = {
  /** children */
  children: React.ReactNode;
  /** 名称 */
  name: string;
  /** 必須項目かどうか(0:必須, 1:任意, 2:無し) */
  isRequired: number;
  /** 余白（下）、単位：px、デフォルト：24 */
  marginBottom?: number;
  /** タイトル幅を狭くする  */
  narrowTitle?: boolean;
};

/**
 * ItemBaseコンポーネント
 * @param {ItemBaseProps} props - プロパティ
 * @returns {JSX.Element} JSX
 */
const ItemBase = (props: ItemBaseProps): JSX.Element => {
  /** 余白（下） */
  const marginBottom = props.marginBottom !== undefined ? props.marginBottom : 10;

  return (
    <Grid container sx={{ alignItems: 'flex-start', justifyContent: 'end', flexWrap: 'nowrap' }}>
      <Grid sx={{ display: 'flex', xs: props.narrowTitle ? 2 : 3, pt: 1 }}>
        <Typography variant="body2" marginRight="16px" sx={{ whiteSpace: 'nowrap' }}>
          {props.name}
        </Typography>
        <Box marginRight="16px" sx={{ whiteSpace: 'nowrap' }}>
          {props.isRequired != 2 ? props.isRequired == 0 ? <RequiredMark /> : <OptionalMark /> : <></>}
        </Box>
      </Grid>
      <Grid sx={{ xs: props.narrowTitle ? 10 : 9 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '640px',
          }}
        >
          {props.children}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ItemBase;
