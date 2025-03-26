import { Add, Delete } from '@mui/icons-material';
import { Box, Button, Grid2 as Grid, IconButton, TextField, Typography } from '@mui/material';
import { fi } from 'date-fns/locale';
import { useState } from 'react';
import { Control, TextFieldElement } from 'react-hook-form-mui';

type Props = {
  // ※流用可能にしたいのでany型です。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  data?: Array<DepartmentData>;
};

// 部署情報
type DepartmentData = {
  // 部署ID
  id: string;
  // 部署名
  name: string;
  // 編集可否 true:編集可能,false:編集不可
  isEdit: boolean;
};

// 部署情報の初期値
const initData: DepartmentData = { id: '', name: '', isEdit: true };

export const DepartmentInput = (props: Props) => {
  // 部署情報が1件も存在しない場合は空情報を追加する
  // 部署情報が存在する場合は、その分だけ表示する

  const [fields, setFields] = useState<string[]>(['']);

  const addField = () => {
    const newArray = [...fields, ''];
    setFields(newArray);
  };

  const deleteField = (index: number) => {
    console.log('fields:' + fields.join(','));

    const newArray = fields
      .map((value, i) => {
        if (index !== i) {
          return value;
        }
        return;
      })
      .filter((f) => f !== undefined);
    setFields(newArray);
  };

  const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newFields = [...fields];
    newFields[index] = event.target.value;
    setFields(newFields);
  };

  return (
    <Grid container>
      {fields ? (
        fields.map((field, index) => (
          <Grid key={index}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '640px',
                mb: 1,
              }}
            >
              <TextField
                size="small"
                color={'primary'}
                name={'departmentInfo' + index}
                onChange={(e) => handleChange(index, e)}
                fullWidth
                slotProps={{ htmlInput: { maxLength: 256 } }}
                value={field}
              />
              <IconButton
                onClick={() => {
                  deleteField(index);
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          </Grid>
        ))
      ) : (
        <></>
      )}

      <Grid>
        <Box>
          <Button variant="outlined" startIcon={<Add />} onClick={addField}>
            <Typography>追加</Typography>
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};
