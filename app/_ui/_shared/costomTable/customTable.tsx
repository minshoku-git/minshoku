import { Box, Divider, Table, TableBody, TableContainer, Typography } from '@mui/material';
import { JSX } from 'react';
import React from 'react';

import { PaginateData } from '@/app/_lib/supabase/types';
import { HeaderStatus } from '@/app/_types/types';
import CustomPagination from '@/app/_ui/_shared/costomTable/costomPagination';
import { CustomTableHead } from '@/app/_ui/_shared/costomTable/customTableHead';

type CustomTableProps = {
  paginate?: PaginateData;
  header: HeaderStatus[];
  sortHandler: (sortColumn: string, ascending: boolean) => void;
  pageChangeHandler: (_event: React.ChangeEvent<unknown>, nextPage: number) => void;
  renderBody: () => React.ReactNode;
};

/**
 * CustomTableコンポーネント。
 * @param {CustomTableProps}
 * @returns {JSX.Element} JSX
 */
export const CustomTable = ({
  paginate,
  header,
  sortHandler,
  pageChangeHandler,
  renderBody,
}: CustomTableProps): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const count = paginate?.count ?? 0;

  /* useState
  ------------------------------------------------------------------ */
  // ソート配列
  const [sortArray, setSortArray] = React.useState<HeaderStatus[]>(header);
  // 現在のソート対象項目
  const [sortTarget, setSortTarget] = React.useState<HeaderStatus>(header[0]);

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Divider sx={{ my: 3 }} />
      {count > 0 ? (
        <>
          {/* 検索件数 */}
          <Box sx={{ display: 'flex', alignItems: 'end' }}>
            <Box color="inherit" sx={{ flexGrow: 1, fontSize: '14px' }}>
              {paginate?.startRow} ~ {paginate?.endRow}件 / {count}件
            </Box>
          </Box>
          {/* 検索結果 */}
          <TableContainer sx={{ mt: 1, mb: 3 }}>
            <Table className={'table-bordered'} sx={{ tableLayout: 'auto', width: '100%' }}>
              <CustomTableHead
                header={header}
                sortHandler={sortHandler}
                sortArray={sortArray}
                sortTarget={sortTarget}
                setSortArray={setSortArray}
                setSortTarget={setSortTarget}
              />
              <TableBody>{renderBody()}</TableBody>
            </Table>
          </TableContainer>
          {/* ページネート */}
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
