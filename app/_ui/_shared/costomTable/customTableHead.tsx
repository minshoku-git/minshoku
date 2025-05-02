import { Box, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import React from 'react';

import { SortType } from '@/app/_types/enum';
import { HeaderStatus } from '@/app/_types/types';

type Props = {
  header: Array<HeaderStatus>;
  sortArray: Array<HeaderStatus>;
  sortTarget: HeaderStatus;
  sortHandler: (sortColumn: string, ascending: boolean) => void;
  setSortArray: React.Dispatch<React.SetStateAction<HeaderStatus[]>>;
  setSortTarget: React.Dispatch<React.SetStateAction<HeaderStatus>>;
};

/**
 * ResultHeaderコンポーネント。
 * @param {UserSearchResultProps} props
 * @returns {JSX.Element} JSX
 */
export const CustomTableHead = (props: Props): React.JSX.Element => {
  /* functions
  ------------------------------------------------------------------ */
  const sortChangeHandler = React.useMemo(() => {
    return (header: HeaderStatus) => {
      const setType = SortType.ASC === header.sort ? SortType.DESC : SortType.ASC;
      const jadge = props.sortTarget.name === header.name;
      const res = jadge
        ? // ソートしたい対象が同じなら、逆のソート順に変更して、他の項目を昇順に変更。
          props.sortArray.map((item) =>
            item.name === header.name ? { ...item, sort: setType } : { ...item, sort: SortType.ASC }
          )
        : // それ以外の場合は、選択した項目を昇順として、他の項目も昇順に変更。
          props.sortArray.map((item) =>
            item.name === header.name ? { ...item, sort: SortType.ASC } : { ...item, sort: SortType.ASC }
          );

      // ソートAPI実行
      props.sortHandler(header.variableName, jadge ? (SortType.ASC === setType ? true : false) : true);

      // 表示を最新化
      props.setSortTarget(jadge ? { ...header, sort: setType } : { ...header, sort: SortType.ASC });
      props.setSortArray(res);
    };
  }, [props]);

  return (
    <TableHead>
      <TableRow>
        {props.sortArray.map((item, index) => (
          <TableCell
            sx={{ whiteSpace: 'pre', cursor: 'pointer' }}
            key={index}
            onClick={() => {
              sortChangeHandler(item);
            }}
          >
            <TableSortLabel active={item.name === props.sortTarget.name} direction={item.sort} sx={{ display: 'flex' }}>
              <Box component="div" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                {item.name}
              </Box>
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
