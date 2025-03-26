import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import * as React from 'react';

import { pageMaxCount } from '@/app/_types/values';

/* TODO: タイプ定義ファイルに移動 */
export type ScheduleSearchResult = {
  id: string;
  date: string;
  companyName: string;
  branchName: string;
  menuName: string;
  shokusu: number;
  allergy: Array<string>;
};

/** SearchResultコンポーネントプロパティ */
export type ScheduleSearchResultProps = {
  // ヘッダー情報
  header: string[];
  // 検索結果
  result: ScheduleSearchResult[];
};

/**
 * SearchResultコンポーネント。
 * @param {ScheduleSearchResultProps} props - プロパティ
 * @returns {JSX.Element} JSX
 */
const ScheduleResult = (props: ScheduleSearchResultProps): React.JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */

  /* type
  ------------------------------------------------------------------ */

  /* useState
  ------------------------------------------------------------------ */

  // 表示行数
  const rowsPerPage: number = pageMaxCount();
  // ページ数
  const [pageCount, setPageCount] = React.useState(20);
  // 現在のページ番号
  const [currentPage, setCurrentPage] = React.useState(1);

  /* functions
  ------------------------------------------------------------------ */

  /** ページ変更イベント */
  const changePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  /** テーブル表示件数テキスト */
  const countText: () => string = () => {
    return (
      (currentPage - 1) * rowsPerPage +
      1 +
      '~' +
      (currentPage * rowsPerPage > props.result.length ? props.result.length : currentPage * rowsPerPage) +
      '件/' +
      props.result.length +
      '件'
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'end', mb: 1 }}>
        <Box color="inherit" sx={{ flexGrow: 1, fontSize: '14px' }}>
          {countText()}
        </Box>
      </Box>

      {/* ユーザー情報 */}
      <TableContainer sx={{ mb: 3 }}>
        <Table className={'table-bordered'}>
          <TableHead>
            <TableRow>
              {props.header.map((item, index) => (
                <TableCell sx={{ whiteSpace: 'pre' }} key={index}>
                  {item}
                  <TableSortLabel active={false} direction={'desc'} onClick={() => {}}>
                    <Box component="span"></Box>
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.result.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ whiteSpace: 'pre' }}>{row.date}</TableCell>
                <TableCell>{row.companyName}</TableCell>
                <TableCell>{row.branchName}</TableCell>
                <TableCell>{row.menuName}</TableCell>
                <TableCell>{row.shokusu}</TableCell>
                <TableCell>{row.allergy.join(' , ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
          color="primary"
          shape="rounded"
          size="large"
          count={pageCount}
          page={currentPage}
          onChange={changePage}
        />
      </Box>
    </>
  );
};

export default ScheduleResult;
