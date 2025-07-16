import { Box, Button, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { Suspense } from 'react';

import { OrderStatus } from '@/app/_types/enum';
import { ApiResponse } from '@/app/_types/types';
import CustomModal from '@/app/_ui/_shared/customModal';

import { orderDeteilResponseData } from './_lib/types';

/** OrderInfoModalPropsコンポーネントプロパティ */
type OrderInfoModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  searchedDate: Date;
  cancelHandler: () => void;
  data: ApiResponse<orderDeteilResponseData> | undefined;
  isFetching: boolean;
};

/**
 * OrderInfoModalコンポーネント。
 * 注文情報を表示するモーダルです。
 * @returns {JSX.Element} JSX
 */
const OrderInfoModal = (props: OrderInfoModalProps): React.JSX.Element => {
  const data = props.data?.data;
  const t_c = data?.t_companies;
  const address =
    (t_c?.prefectures ?? '') + t_c?.municipalities + t_c?.town_area + t_c?.area_block_number + t_c?.building_name;

  return (
    <>
      <CustomModal title="オーダー詳細" width={900} open={props.open} onClose={() => props.setOpen(false)}>
        {props.isFetching ? (
          <Skeleton variant="rectangular" animation="wave" height={440} />
        ) : (
          <>
            <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {/* ユーザー情報 */}
              <Grid size={{ xs: 12 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ユーザー名</TableCell>
                        <TableCell>メールアドレス</TableCell>
                        <TableCell>注文数/履歴</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ maxWidth: 300, overflowY: 'auto', maxHeight: 280 }}>
                      <TableRow>
                        <TableCell>{`${data?.t_user.user_name} (${data?.t_user.user_name_kana})`}</TableCell>
                        <TableCell>{data?.t_user.user_email}</TableCell>
                        <TableCell>(4回)2021/07/21</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              {/* 会社情報 */}
              <Grid size={{ xs: 12 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>会社名</TableCell>
                        <TableCell>支店名</TableCell>
                        <TableCell>部署名</TableCell>
                        <TableCell>任意項目</TableCell>
                        <TableCell>雇用形態名</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ maxWidth: 300, overflowY: 'auto', maxHeight: 280 }}>
                      <TableRow>
                        <TableCell>{data?.t_companies.company_name}</TableCell>
                        <TableCell>{data?.t_companies.branch_name}</TableCell>
                        <TableCell>{data?.t_companies_department.department_name}</TableCell>
                        <TableCell>xxxxxxxx</TableCell>
                        <TableCell>{data?.t_companies_employment_status.employment_status_name}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              {/* 注文履歴 */}
              <Grid size={{ xs: 12 }}>
                <TableContainer sx={{ maxHeight: '320px' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>配達日</TableCell>
                        <TableCell>店舗名</TableCell>
                        <TableCell>注文内容</TableCell>
                        <TableCell>金額</TableCell>
                        <TableCell>決済方法</TableCell>
                        <TableCell>注文ステータス</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ maxWidth: 300 }}>
                      <TableRow key={0}>
                        <TableCell>2025/05/21</TableCell>
                        <TableCell>{data?.t_shops.shop_name}</TableCell>
                        <TableCell>チキンカレー：1個</TableCell>
                        <TableCell>{data?.amount}円</TableCell>
                        <TableCell>クレジットカード</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {data?.order_status === OrderStatus.VALID ? '有効' : 'キャンセル'}
                            <Box sx={{ flexGrow: 1 }} />
                            {data?.order_status === OrderStatus.VALID && (
                              <Button variant="contained" type="submit" color="error" onClick={props.cancelHandler}>
                                キャンセル
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </>
        )}
      </CustomModal>
    </>
  );
};

export default OrderInfoModal;
