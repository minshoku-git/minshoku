import { Add, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid2 as Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { JSX } from 'react';
import { CheckboxElement, Control, FieldArrayWithId, TextFieldElement } from 'react-hook-form-mui';

import { CompanyDetailFormValues } from '@/app/_types/types';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  addField: () => void;
  removeField: (index: number) => void;
  fields?: FieldArrayWithId<CompanyDetailFormValues, 'employmentTypeInfo', 'id'>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
};

/**
 * EmploymentInputコンポーネント
 * @param {Props} props
 * @returns {JSX.Element} JSX
 */
export const EmploymentInput = (props: Props): JSX.Element => {
  // 入力値の前後の空白削除・入力値の全角空白を半角空白に置換・連続した空白を1個の半角空白にまとめる
  const trimSpase = (value: string, index: number) => {
    props.setValue(`employmentTypeInfo.${index}.name`, value.trim().replace(/[ 　]+/g, ' '));
    return;
  };
  return (
    <>
      {/* 雇用種別情報 */}
      <Grid container>
        <Grid width={'100%'}>
          {props.fields ? (
            props.fields.length > 0 && (
              <TableContainer sx={{ mb: 1 }}>
                <Table>
                  {/* header */}
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" width={'35%'} sx={{ p: 0 }}>
                        雇用形態名
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap', p: 0 }} width={'15%'}>
                        会社清算
                      </TableCell>
                      <TableCell
                        width={'15%'}
                        align="center"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word',
                          fontSize: '0.8rem',
                          p: 1,
                        }}
                      >
                        {'クレジット\nカード'}
                      </TableCell>
                      <TableCell align="center" width={'15%'} sx={{ p: 0 }}>
                        PayPay
                      </TableCell>
                      <TableCell align="center" width={'30%'} sx={{ p: 0 }}>
                        会社負担額
                      </TableCell>
                      <TableCell align="center" width={'5%'} sx={{ p: 0 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  {/* body */}
                  <TableBody>
                    {props.fields.map((field, index) => (
                      <TableRow key={index}>
                        {/* 雇用形態名 */}
                        <TableCell align="center">
                          <TextFieldElement
                            control={props.control}
                            name={`employmentTypeInfo.${index}.name`}
                            size={'small'}
                            onBlur={(e) => {
                              trimSpase(e?.target?.value, index);
                            }}
                          />
                        </TableCell>
                        {/* 会社清算 */}
                        <TableCell align="center">
                          <CheckboxElement
                            control={props.control}
                            name={`employmentTypeInfo.${index}.isDeduction`}
                            sx={{ marginLeft: '11px', marginRight: '-16px' }}
                          />
                        </TableCell>
                        {/* クレジットカード */}
                        <TableCell align="center">
                          <CheckboxElement
                            control={props.control}
                            name={`employmentTypeInfo.${index}.isCreditCard`}
                            sx={{ marginLeft: '11px', marginRight: '-16px' }}
                          />
                        </TableCell>
                        {/* PayPay */}
                        <TableCell align="center">
                          <CheckboxElement
                            control={props.control}
                            name={`employmentTypeInfo.${index}.isPayPay`}
                            sx={{ marginLeft: '11px', marginRight: '-16px' }}
                          />
                        </TableCell>
                        {/* 会社負担 */}
                        <TableCell align="center">
                          <TextFieldElement
                            control={props.control}
                            slotProps={{
                              htmlInput: { maxLength: 5 },
                            }}
                            name={`employmentTypeInfo.${index}.burdenAmount`}
                            size={'small'}
                            sx={{ input: { textAlign: 'right' } }}
                          />
                        </TableCell>
                        {/* 削除 */}
                        <TableCell align="center" sx={{ p: '2px' }}>
                          {props.fields && props.fields.length > 1 ? (
                            <IconButton onClick={() => props.removeField(index)} disabled={field.disabled}>
                              <Delete />
                            </IconButton>
                          ) : (
                            <Box sx={{ width: '40px' }}>
                              <Delete color="disabled" />
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          ) : (
            <></>
          )}
        </Grid>
        <Grid>
          <Box>
            <Button variant="outlined" startIcon={<Add />} onClick={props.addField}>
              <Typography>追加</Typography>
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};
