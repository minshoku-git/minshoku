import { Add, Delete } from '@mui/icons-material';
import { Box, Button, Grid2 as Grid, IconButton, Typography } from '@mui/material';
import { JSX } from 'react';
import { Control, FieldArrayWithId, TextFieldElement } from 'react-hook-form-mui';

import { CompanyDetailFormValues } from '@/app/_types/types';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  addField: () => void;
  removeField: (index: number) => void;
  fields?: FieldArrayWithId<CompanyDetailFormValues, 'departmentInfo', 'id'>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
};

/**
 * DepartmentInputコンポーネント
 * @param {Props} props
 * @returns {JSX.Element} JSX
 */
export const DepartmentInput = (props: Props): JSX.Element => {
  // 入力値の前後の空白削除・入力値の全角空白を半角空白に置換・連続した空白を1個の半角空白にまとめる
  const trimSpase = (value: string, index: number) => {
    props.setValue(`departmentInfo.${index}.name`, value.trim().replace(/[ 　]+/g, ' '));
    return;
  };
  return (
    <Grid container>
      {props.fields && props.fields.length > 0 ? (
        props.fields.map((field, index) => (
          <Grid key={index}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                width: '640px',
                mb: 1,
              }}
            >
              <TextFieldElement
                control={props.control}
                name={`departmentInfo.${index}.name`}
                disabled={field.disabled}
                slotProps={{ htmlInput: { maxLength: 256 } }}
                size="small"
                color={'primary'}
                onBlur={(e) => {
                  trimSpase(e?.target?.value, index);
                }}
                fullWidth
              />
              {props.fields && props.fields.length > 1 ? (
                <IconButton
                  disabled={field.disabled}
                  onClick={() => {
                    props.removeField(index);
                  }}
                >
                  <Delete />
                </IconButton>
              ) : (
                <IconButton disabled>
                  <Delete />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))
      ) : (
        <></>
      )}
      <Grid>
        <Box>
          <Button variant="outlined" startIcon={<Add />} onClick={props.addField}>
            <Typography>追加</Typography>
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};
