import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { JSX } from 'react';
import React from 'react';

import { SortType } from '@/app/_types/enum';
import { HeaderStatus, PaginateData } from '@/app/_types/types';

import CustomPagination from './customPagination';

type CustomTableProps = {
  /* ページネート情報 */
  paginate?: PaginateData;
  /* ソートHandler */
  sortHandler: (sortColumn: string, ascending: boolean) => void;
  /* ページ遷移Handler */
  pageChangeHandler: (_event: React.ChangeEvent<unknown>, nextPage: number) => void;
  /* ヘッダー情報 */
  header: HeaderStatus[];
  /* useState - ソート配列 */
  sortArray: Array<HeaderStatus>;
  setSortArray: React.Dispatch<React.SetStateAction<HeaderStatus[]>>;
  /* useState - 現在のソート対象項目 */
  sortTarget: HeaderStatus;
  setSortTarget: React.Dispatch<React.SetStateAction<HeaderStatus>>;
  /* Body */
  renderBody: () => React.ReactNode;
};

/**
 * CustomTableコンポーネント。
 * @param {CustomTableProps}
 * @returns {JSX.Element} JSX
 */
export const CustomTable = ({
  paginate,
  sortHandler,
  pageChangeHandler,
  renderBody,
  sortArray,
  setSortArray,
  sortTarget,
  setSortTarget,
}: CustomTableProps): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const count = paginate?.count ?? 0;

  /* functions
  ------------------------------------------------------------------ */

  /**
   * ResultHeaderコンポーネント。
   * @param {HeaderStatus} - header
   * @returns {void}
   */
  const sortChangeHandler = React.useMemo(() => {
    return (header: HeaderStatus) => {
      const setType = SortType.ASC === header.sort ? SortType.DESC : SortType.ASC;
      const jadge = sortTarget.name === header.name;
      const res = jadge
        ? // ソートしたい対象が同じなら、逆のソート順に変更して、他の項目を昇順に変更。
        sortArray.map((item) =>
          item.name === header.name ? { ...item, sort: setType } : { ...item, sort: SortType.ASC }
        )
        : // それ以外の場合は、選択した項目を昇順として、他の項目も昇順に変更。
        sortArray.map((item) =>
          item.name === header.name ? { ...item, sort: SortType.ASC } : { ...item, sort: SortType.ASC }
        );

      // ソートAPI実行
      sortHandler(header.variableName, jadge ? (SortType.ASC === setType ? true : false) : true);

      // 表示を最新化
      setSortTarget(jadge ? { ...header, sort: setType } : { ...header, sort: SortType.ASC });
      setSortArray(res);
    };
  }, [setSortArray, setSortTarget, sortArray, sortHandler, sortTarget.name]);

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {count > 0 ? (
        <>
          {/* 検索結果 */}
          <TableContainer sx={{ mt: 1, mb: 3 }}>
            <Table className={'table-bordered'} sx={{ tableLayout: 'auto', width: '100%' }}>
              {/* Head */}
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
                      <TableSortLabel
                        active={item.name === sortTarget.name}
                        direction={item.sort}
                        sx={{ display: 'flex' }}
                      >
                        <Box component="div" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                          {item.name}
                        </Box>
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              {/* Body */}
              <TableBody>{renderBody()}</TableBody>
            </Table>
          </TableContainer>
          {/* Pagination */}
          <CustomPagination
            totalPage={paginate?.totalPage}
            currentPage={paginate?.currentPage}
            pageChangeHandler={pageChangeHandler}
          />
        </>
      ) : (
        <Typography sx={{ fontSize: '1rem' }}>検索結果に一致するデータは存在しません。</Typography>
      )}
    </>
  );
};
