import { Launch, Tab } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { OrderStatusType, PaymentType } from '@/app/_types/enum';
import { ApiResponse } from '@/app/_types/types';
import CustomModal from '@/app/_ui/_shared/customModal';

import { orderDeteilResponseData } from './_lib/types';

/** OrderInfoModalPropsコンポーネントプロパティ */
type OrderInfoModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  searchedDate: Date;
  cancelHandler: (id: number) => void;
  openUserDetailHandler: (id: number) => void;
  openCompanyDetailHandler: (id: number) => void;
  data: ApiResponse<orderDeteilResponseData> | undefined;
  isFetching: boolean;
};

const styles: { [key: string]: React.CSSProperties } = {
  tableCell: {
    padding: '5px 12px',
  },
  tableBodyCell: {
    padding: '10px',
  },
  // コンテナ
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100svh',
  },
  // メインコンテナ
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '32px',
  },
  // ボタン
  button: {
    width: '50%',
  },
};

/**
 * OrderInfoModalコンポーネント。
 * 注文情報を表示するモーダルです。
 * @returns {JSX.Element} JSX
 */
const OrderInfoModal = (props: OrderInfoModalProps): React.JSX.Element => {
  const data = props.data?.success ? props.data.data : null;

  return (
    <>
      <CustomModal title="オーダー詳細" width={900} open={props.open} onClose={() => props.setOpen(false)}>
        {props.isFetching ? (
          <Skeleton variant="rectangular" animation="wave" height={440} />
        ) : (
          <>
            {data && (
              <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                {/* ユーザー情報 */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...styles.tableCell, width: '36%' }}>ユーザー名</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '36%' }}>メールアドレス</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '14%', textAlign: 'center' }}>
                          累計注文数
                        </TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '14%', textAlign: 'center' }}>
                          前回注文日時
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ maxWidth: 300, overflowY: 'auto', maxHeight: 280 }}>
                      <TableRow>
                        <TableCell sx={{ ...styles.tableBodyCell }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {`${data.t_user.user_name} (${data.t_user.user_name_kana})`}
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton
                              sx={{ ml: 1 }}
                              color="primary"
                              onClick={() => props.openUserDetailHandler(data.t_user.id ?? 0)}
                            >
                              <Launch />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell }}>{data.t_user.user_email}</TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell, textAlign: 'center' }}>
                          {data.totalOrderCount} 回
                        </TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell, textAlign: 'center' }}>
                          {data.lastOrderDateTime ? data.lastOrderDateTime : 'なし'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* 会社情報 */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...styles.tableCell, width: '30%' }}>会社名</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '28%' }}>支店名</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '28%' }}>部署名</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '14%', textAlign: 'center' }}>
                          雇用形態名
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ maxWidth: 300, overflowY: 'auto', maxHeight: 280 }}>
                      <TableRow>
                        <TableCell sx={{ ...styles.tableBodyCell }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {data.t_companies.company_name}
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton
                              sx={{ ml: 1 }}
                              color="primary"
                              onClick={() => props.openCompanyDetailHandler(data.t_companies.id!)}
                            >
                              <Launch />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell }}>{data.t_companies.branch_name}</TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell }}>
                          {data.t_companies_department.department_name}
                        </TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell, textAlign: 'center' }}>
                          {data.t_companies_employment_status.employment_status_name}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* 任意項目 */}
                {((data.t_companies.optional_item_title_1 && data.t_user.optional_item_answer_1) ||
                  (data.t_companies.optional_item_title_2 && data.t_user.optional_item_answer_2)) && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ ...styles.tableCell, width: '40%' }}>任意項目</TableCell>
                            <TableCell sx={{ ...styles.tableCell, width: '70%' }}>回答</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.t_companies.optional_item_title_1 && data.t_user.optional_item_answer_1 && (
                            <TableRow>
                              <TableCell sx={{ ...styles.tableBodyCell }}>
                                {data.t_companies.optional_item_title_1}
                              </TableCell>
                              <TableCell sx={{ ...styles.tableBodyCell }}>{data.t_user.optional_item_answer_1}</TableCell>
                            </TableRow>
                          )}
                          {data.t_companies.optional_item_title_2 && data.t_user.optional_item_answer_2 && (
                            <TableRow>
                              <TableCell sx={{ ...styles.tableBodyCell }}>
                                {data.t_companies.optional_item_title_2}
                              </TableCell>
                              <TableCell sx={{ ...styles.tableBodyCell }}>{data.t_user.optional_item_answer_2}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                {/* 注文履歴 */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...styles.tableCell, width: '20%' }}>配達日</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '20%' }}>注文日時</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '20%' }}>決済方法</TableCell>
                        <TableCell
                          sx={{
                            ...styles.tableCell,
                            width: data.order_status_type !== OrderStatusType.VALID ? '20%' : '40%',
                          }}
                        >
                          注文ステータス
                        </TableCell>
                        {data.order_status_type !== OrderStatusType.VALID && (
                          <TableCell sx={{ ...styles.tableCell, width: '20%' }}>キャンセル日時</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ maxWidth: 300 }}>
                      <TableRow key={0}>
                        <TableCell sx={{ ...styles.tableCell }}>{data.delivery_day as string}</TableCell>
                        <TableCell sx={{ ...styles.tableCell }}>{data.order_datetime as string}</TableCell>
                        <TableCell sx={{ ...styles.tableCell }}>
                          {data.payment_type === PaymentType.SALAEY_DEDUCTIONS
                            ? '会社清算'
                            : data.payment_type === PaymentType.CREDITCARD
                              ? 'クレジットカード'
                              : 'PayPay'}
                        </TableCell>
                        <TableCell sx={{ ...styles.tableCell }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {data.order_status_type === OrderStatusType.VALID
                              ? '有効'
                              : data.order_status_type === OrderStatusType.USER_CANCEL
                                ? 'キャンセル(ユーザー)'
                                : 'キャンセル(システム)'}
                            <Box sx={{ flexGrow: 1 }} />
                            {data.order_status_type === OrderStatusType.VALID && (
                              <Button
                                variant="contained"
                                type="submit"
                                color="error"
                                onClick={() => props.cancelHandler(Number(data.id))}
                              >
                                キャンセル
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                        {data.order_status_type !== OrderStatusType.VALID && (
                          <TableCell>{data.cancel_datetime as string}</TableCell>
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* 注文履歴 */}
                <TableContainer sx={{ maxHeight: '320px' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...styles.tableCell, width: '26%' }}>店舗名</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '26%' }}>メニュー名</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '8%', textAlign: 'center' }}>食数</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '10%', textAlign: 'center' }}>単価</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '10%', textAlign: 'center' }}>小計</TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '10%', textAlign: 'center' }}>
                          会社
                          <br />
                          負担額
                        </TableCell>
                        <TableCell sx={{ ...styles.tableCell, width: '10%', textAlign: 'center' }}>
                          自己
                          <br />
                          負担額
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ maxWidth: 300 }}>
                      <TableRow key={0}>
                        <TableCell>{data.t_shops.shop_name}</TableCell>
                        <TableCell>{data.t_menu_schedule.menu_name}</TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell, textAlign: 'center' }}>{data.count}</TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell, textAlign: 'right' }}>{data.list_price}円</TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell, textAlign: 'right' }}>{data.amount}円</TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell, textAlign: 'right' }}>
                          {data.companies_burden_amount}円
                        </TableCell>
                        <TableCell sx={{ ...styles.tableBodyCell, textAlign: 'right' }}>
                          {data.user_burden_amount}円
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </>
        )}
      </CustomModal>
    </>
  );
};

export default OrderInfoModal;
