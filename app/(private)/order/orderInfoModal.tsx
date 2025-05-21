import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { OrderStatus } from '@/app/_types/enum';
import CustomModal from '@/app/_ui/_shared/customModal';

/** OrderInfoModalPropsコンポーネントプロパティ */
type OrderInfoModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  searchedDate: Date;
  cancelHandler: () => void;
  orderStatus: OrderStatus;
};

/**
 * OrderInfoModalコンポーネント。
 * 注文情報を表示するモーダルです。
 * @returns {JSX.Element} JSX
 */
const OrderInfoModal = (props: OrderInfoModalProps): React.JSX.Element => {
  return (
    <>
      <CustomModal title="オーダー詳細" width={900} open={props.open} onClose={() => props.setOpen(false)}>
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
                    <TableCell>石川 聡（イシカワ ソウ）</TableCell>
                    <TableCell>xxxxxxxx@xxxx.ne.jp</TableCell>
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
                    <TableCell>住所</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ maxWidth: 300, overflowY: 'auto', maxHeight: 280 }}>
                  <TableRow>
                    <TableCell>xxxx株式会社</TableCell>
                    <TableCell>XXXX支店</TableCell>
                    <TableCell>営業部</TableCell>
                    <TableCell>xxxxxxxx</TableCell>
                    <TableCell>社員</TableCell>
                    <TableCell>東京都千代田区xxxx 1-2-3 xxxxビル</TableCell>
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
                    <TableCell>ステータス</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ maxWidth: 300 }}>
                  <TableRow key={0}>
                    <TableCell>2025/05/21</TableCell>
                    <TableCell>カリガリ</TableCell>
                    <TableCell>チキンカレー：1個</TableCell>
                    <TableCell>500円</TableCell>
                    <TableCell>クレジットカード</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {props.orderStatus === OrderStatus.VALID ? '有効' : 'キャンセル'}
                        <Box sx={{ flexGrow: 1 }} />
                        {props.orderStatus === OrderStatus.VALID && (
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
      </CustomModal>
    </>
  );
};

export default OrderInfoModal;
