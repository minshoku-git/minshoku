import { Box } from '@mui/material';
import { JSX } from 'react';

type Props = {
  /** 表示開始件数 */
  startRow: number;
  /** 終了件数 */
  endRow: number;
  /** 合計件数 */
  count: number;
};

/**
 * ResultsCounterコンポーネント
 * 検索結果の上部に表示する検索結果数です。
 * @param {Props} props
 * @returns {JSX.Element} JSX
 */
export const ResultsCounter = (props: Props): JSX.Element => {
  return (
    <Box color="inherit" sx={{ fontSize: '14px' }}>
      {props.startRow} ~ {props.endRow}件 / {props.count}件
    </Box>
  );
};
