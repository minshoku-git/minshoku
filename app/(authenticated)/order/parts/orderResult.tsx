import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import * as React from 'react';
import { JSX } from 'react';

import OrderInfoModal from './orderInfoModal';

/* TODO: タイプ定義ファイルに移動 */
export type OrderSearchResult = {
  id: string;
  userName: string;
  companyName: string;
  totalAmount: number;
  shokusu: number;
  paymentMethod: string;
  date: string;
};

/** SearchResultコンポーネントプロパティ */
export type OrderSearchResultProps = {
  // 遷移ハンドラ
  linkHandler: (id: string) => void;
  // ヘッダー情報
  header: string[];
  // 検索結果
  result: OrderSearchResult[];
};

/**
 * SearchResultコンポーネント。
 * @param {OrderSearchResultProps} props - プロパティ
 * @returns {JSX.Element} JSX
 */
const OrderResult = (props: OrderSearchResultProps): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */

  /* type
  ------------------------------------------------------------------ */

  /* useState
  ------------------------------------------------------------------ */

  // 表示行数
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // ページ数
  const [pageCount, setPageCount] = React.useState(1);
  // 現在のページ番号
  const [currentPage, setCurrentPage] = React.useState(1);
  // モーダル
  const [open, setOpen] = React.useState(false);

  /* functions
  ------------------------------------------------------------------ */

  // props.rows副作用
  React.useEffect(() => {
    const count = Math.floor(props.result.length / 10) + 1;
    setPageCount(count);
    setCurrentPage(1);
  }, [props.result]);

  /** ページ変更イベント */
  const changePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  /** モーダル制御 */
  // TODO 値渡す
  const openModal = () => {
    console.log('click');
    setOpen(true);
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

      {/* オーダー情報 */}
      <TableContainer sx={{ mb: 3 }}>
        <Table className={'table-bordered'}>
          <TableHead>
            <TableRow>
              {props.header.map((item, index) => (
                <TableCell sx={{ whiteSpace: 'pre' }} key={index} style={styles.header}>
                  {item}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.result.map((row, index) => (
              <TableRow key={index} hover sx={{ '&:hover': { cursor: 'pointer' } }} onClick={openModal}>
                <TableCell style={styles.body}>{row.date}</TableCell>
                <TableCell style={styles.body} sx={{ whiteSpace: 'pre' }} key={index}>
                  {row.userName}
                </TableCell>
                <TableCell style={styles.body}>{row.companyName}</TableCell>
                <TableCell style={styles.body} align={'right'}>
                  {row.shokusu}
                </TableCell>
                <TableCell style={styles.body} align={'right'}>
                  {row.totalAmount}
                </TableCell>
                <TableCell style={styles.body}>{row.paymentMethod}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination color="primary" count={pageCount} page={currentPage} onChange={changePage} />
      <OrderInfoModal open={open} setOpen={setOpen} searchedDate={new Date()} />
    </>
  );
};

export default OrderResult;

/* style
---------------------------------------------------------------------------------------------------- */
/** @type {{ [key: string]: React.CSSProperties }} style */
const styles: { [key: string]: React.CSSProperties } = {
  // table
  header: {
    border: 'solid 1px lightgray',
    borderBottom: 'double 3px lightgray',
  },
  body: {
    border: 'solid 1px lightgray',
  },
};
