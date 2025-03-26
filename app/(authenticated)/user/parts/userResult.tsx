import {
  Box,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import * as React from 'react';

import { SortType } from '@/app/_types/enum';
import { pageMaxCount } from '@/app/_types/values';
import Processing from '@/app/_ui/shared/Processing';

export type HeaderStatus = {
  // ヘッダー名
  name: string;
  // 変数名
  variableName: string;
  // ソートタイプ 0:昇順, 1:降順
  sort: SortType;
};

export type UserSearchResult = {
  id: string;
  userName: string;
  companyName: string;
  status: string;
  [key: string]: string;
};

/** SearchResultコンポーネントプロパティ */
export type UserSearchResultProps = {
  linkHandler: (id: string) => void;
  // 会社名・お届け先名毎のオーダー情報のヘッダ
  header: Array<HeaderStatus>;
  // 会社名・お届け先名毎のオーダー情報
  result: UserSearchResult[];
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

  // 待機中
  const [processing, setProcessing] = React.useState<boolean>(false);
  // 表示行数
  const rowsPerPage: number = pageMaxCount();
  // ページ数
  const [pageCount, setPageCount] = React.useState(20);
  // 現在のページ番号
  const [currentPage, setCurrentPage] = React.useState(1);
  // モーダル
  const [open, setOpen] = React.useState(false);
  // ソート配列
  const [sortArray, setSortArray] = React.useState<HeaderStatus[]>(props.header);
  // 現在のソート対象項目
  const [sortTarget, setSortTarget] = React.useState<HeaderStatus>(props.header[0]);

  const totalCount = 600; //totalCount

  /* functions
  ------------------------------------------------------------------ */

  /** CSVダウンロードクリックイベント */
  const onCSVDownloadClick = () => {};

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
      (currentPage * rowsPerPage > totalCount ? totalCount : currentPage * rowsPerPage) +
      '件/' +
      totalCount +
      '件'
    );
  };

  // ソート変更ハンドラー ※APIも叩く
  const sortChangeHandler = React.useMemo(() => {
    return (header: HeaderStatus) => {
      const setType = SortType.ASC === header.sort ? SortType.DESC : SortType.ASC;
      const jadge = sortTarget.name === header.name;
      const res = jadge
        ? // ソートしたい対象が同じなら、逆のソート順に変更して、他の項目を昇順に変更。
          sortArray.map((item) =>
            item.name === header.name ? { ...item, sort: setType } : { ...item, sort: SortType.ASC }
          )
        : // それ以外の場合は、選択した項目を降順として、他の項目を昇順に変更。
          sortArray.map((item) =>
            item.name === header.name ? { ...item, sort: SortType.ASC } : { ...item, sort: SortType.ASC }
          );
      setProcessing(true);

      // TODO:APIを叩く
      setTimeout(() => {
        // TASK: 呼び出し元でAPIを叩いた方がいいのでは？
        // この部品は検索条件を持っていないので、ソート条件だけを渡してしまうのは？
        // 呼出元に渡すもの：ソート条件の項目名と昇順or降順だけでOK
        // ソート項目は、配列で優先順にまとめておいて、渡ってきた項目名と一致するものを先頭に移動させる。

        setSortTarget(jadge ? { ...header, sort: setType } : { ...header, sort: SortType.ASC });
        setSortArray(res);
        setProcessing(false);
      }, 1000);
    };
  }, [sortArray, sortTarget.name]);

  return (
    <>
      <Processing open={processing} />
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
              {sortArray.map((item, index) => (
                <TableCell
                  sx={{ whiteSpace: 'pre', cursor: 'pointer' }}
                  key={index}
                  onClick={() => {
                    sortChangeHandler(item);
                  }}
                >
                  <TableSortLabel active={item.name === sortTarget.name} direction={item.sort} sx={{ display: 'flex' }}>
                    <Box component="div" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      {item.name}
                    </Box>
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
                {props.header.map((item, index) => (
                  <TableCell sx={{ whiteSpace: 'pre' }} key={index}>
                    {`${row[item.variableName]}`}
                  </TableCell>
                ))}
                {/* 共通部品にできるけれど、仕様が確定しないので、一旦保留とする。 */}
                {/* <TableCell sx={{ whiteSpace: 'pre' }}>{row.userName}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre' }}>{row.companyName}</TableCell>
                <TableCell>{row.id}</TableCell> */}
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

export default UserResult;
