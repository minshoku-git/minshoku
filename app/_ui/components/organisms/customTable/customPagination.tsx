import { Box } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { JSX } from 'react';

type CustomPaginationProps = {
  /** 総ページ数 */
  totalPage?: number;
  /** 現在のページ */
  currentPage?: number;
  /** ページ送りハンドラ */
  pageChangeHandler: (_event: React.ChangeEvent<unknown>, nextPage: number) => void;
};

/**
 * CustomPaginationコンポーネント
 * カスタムページネートです。
 * @param {CustomPaginationProps} props
 * @returns {JSX.Element} JSX
 */
const CustomPagination = (props: CustomPaginationProps): JSX.Element => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Pagination
        color="primary"
        shape="rounded"
        size="large"
        count={props.totalPage}
        page={props.currentPage}
        onChange={props.pageChangeHandler}
      />
    </Box>
  );
};

export default CustomPagination;
