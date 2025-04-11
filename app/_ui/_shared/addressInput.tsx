import { Add, Delete } from '@mui/icons-material';
import { Box, Button, Grid2 as Grid, IconButton, TextField, Typography } from '@mui/material';
import { Control, FieldArrayWithId, SelectElement } from 'react-hook-form-mui';

import { CompanyDetailFormValues } from '@/app/_types/types';

interface SelectProps {
  id: string;
  label: string;
  value: string;
}

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  addField: () => void;
  removeField: (index: number) => void;
  fields?: FieldArrayWithId<CompanyDetailFormValues, 'departmentInfo', 'id'>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  stateData: Array<string>;
  cityData: Array<string>;
  townData: Array<string>;
};

export const AddressInput = (props: Props) => {
  // TODO:
  // 左から順に選択する。選択すると右隣が活性化する。
  // 2番目まで入力されているとき、1番目を変更すると、2番目をリセットする
  // 3番目まで入力されているとき、1番目を変更すると2,3番目をリセットする
  // 3番目まで入力されているとき、2番目を変更すると3番目をリセットする

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '640px',
        }}
        gap={2}
      >
        <SelectElement
          control={props.control}
          size="small"
          name="state"
          label="都道府県"
          fullWidth
          options={props.stateData}
        ></SelectElement>
        <SelectElement
          control={props.control}
          size="small"
          name="city"
          label="市区"
          fullWidth
          disabled={true}
          options={[
            { id: '', label: '未選択', value: '未選択' },
            { id: '10', label: '市区1', value: '市区1' },
            { id: '20', label: '市区2', value: '市区2' },
            { id: '30', label: '市区3', value: '市区3' },
          ]}
        ></SelectElement>
        <SelectElement
          control={props.control}
          size="small"
          name="town"
          label="町村"
          fullWidth
          disabled={true}
          options={[
            { id: '', label: '未選択' },
            { id: '10', label: '町村1' },
            { id: '20', label: '町村2' },
            { id: '30', label: '町村3' },
          ]}
        ></SelectElement>
      </Box>
    </>
  );
};
