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

/** SearchResultコンポーネントプロパティ */
export type UserSearchResultProps = {
  linkHandler: (id: string) => void;
  // 会社名・お届け先名毎のオーダー情報のヘッダ
  header: string[];
  // 会社名・お届け先名毎のオーダー情報
  result: {
    id: string;
    userName: string;
    companyName: string;
    status: string;
  }[];
};

/**
 * SearchResultコンポーネント。
 * @param {UserSearchResultProps} props - プロパティ
 * @returns {JSX.Element} JSX
 */
const UserResult = (props: UserSearchResultProps): React.JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */

  /* type
  ------------------------------------------------------------------ */

  /* useState
  ------------------------------------------------------------------ */

  // 表示行数
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // ページ数
  const [pageCount, setPageCount] = React.useState(20);
  // 現在のページ番号
  const [currentPage, setCurrentPage] = React.useState(1);
  // モーダル
  const [open, setOpen] = React.useState(false);

  /* functions
  ------------------------------------------------------------------ */

  /** ページ変更イベント */
  const changePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  /** CSVダウンロードクリックイベント */
  const onCSVDownloadClick = () => {};

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
              <TableRow
                key={index}
                hover
                sx={{ '&:hover': { cursor: 'pointer' } }}
                onClick={() => {
                  props.linkHandler(row.id);
                }}
              >
                <TableCell sx={{ whiteSpace: 'pre' }} key={index}>
                  {row.userName}
                </TableCell>
                <TableCell>{row.companyName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination color="primary" count={pageCount} page={currentPage} onChange={changePage} />
    </>
  );
};

export default UserResult;
