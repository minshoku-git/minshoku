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

/* TODO: タイプ定義ファイルに移動 */
export type CompanySearchResult = {
  id: string;
  companyName: string;
  branchName: string;
  address: string;
  status: string;
};

/** SearchResultコンポーネントプロパティ */
export type CompanySearchResultProps = {
  // 遷移ハンドラ
  linkHandler: (id: string) => void;
  // ヘッダー情報
  header: Array<string>;
  // 検索結果
  result: Array<CompanySearchResult>;
};

/**
 * 会社一覧明細行コンポーネント。
 * @param {CompanySearchResultProps} props - プロパティ
 * @returns {JSX.Element} JSX
 */
const ScheduleResult = (props: CompanySearchResultProps): React.JSX.Element => {
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
        <Button onClick={onCSVDownloadClick}>CSV出力</Button>
      </Box>

      {/* ユーザー情報 */}
      <TableContainer sx={{ mb: 3 }}>
        <Table className={'table-bordered'} sx={{ tableLayout: 'auto', width: '100%' }}>
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
                <TableCell width={'20%'}>{row.companyName}</TableCell>
                <TableCell width={'20%'}>{row.branchName}</TableCell>
                <TableCell
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    overflowWrap: 'break-word',
                  }}
                  width={'50%'}
                >
                  {row.address}
                </TableCell>
                <TableCell width={'10%'}>{row.status}</TableCell>
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
