import { CompanySearchResult } from '../(authenticated)/company/parts/companyResult';
import { OrderSearchResult } from '../(authenticated)/order/parts/orderResult';
import { ScheduleSearchResult } from '../(authenticated)/schedule/parts/scheduleResult';
import { ShopSearchResult } from '../(authenticated)/shop/component';
import { UserSearchResult } from '../(authenticated)/user/component';

/* 検索結果のモックデータ作成 */
export function MockDataCreate_UserResult() {
  const result: UserSearchResult[] = [];
  for (let i = 0; i < 30; i++) {
    result.push({
      id: i.toString(),
      userName: 'userName' + i,
      companyName:
        i % 2
          ? '株式会社リファクト'
          : i % 3
            ? '株式会社エブリイホーミイホールディングス'
            : '株式会社YPYエデュケーション',
      status: i % 2 ? '利用可能' : i % 3 ? '利用可能' : '利用停止',
    });
  }
  return result;
}

export function MockDataCreate_OrderResult() {
  const result: OrderSearchResult[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: i.toString(),
      userName: 'userName' + i,
      companyName:
        i % 2
          ? '株式会社リファクト'
          : i % 3
            ? '株式会社エブリイホーミイホールディングス'
            : '株式会社YPYエデュケーション',
      totalAmount: 100 + i,
      shokusu: i,
      paymentMethod: i % 2 ? '会社清算' : i % 3 ? 'クレジットカード' : 'PayPay',
      date: '2025/4/' + i,
    });
  }
  return result;
}

export function MockDataCreate_ScheduleResult() {
  const result: ScheduleSearchResult[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: i.toString(),
      date: '2025/4/' + i,
      companyName: '株式会社リファクト',
      branchName: i % 2 ? '本郷事業所' : '札幌事業所',
      menuName: i % 2 ? 'チキンカレー' : i % 3 ? 'マッサマンカレー' : 'ビーフカレー',
      shokusu: i,
      allergy: i % 2 ? ['ごま', '卵', '乳', '落花生', '大豆'] : i % 3 ? ['えび', 'かに'] : [],
    });
  }
  return result;
}

export function MockDataCreate_ShopSearchResult() {
  const result: ShopSearchResult[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: i.toString(),
      shopName: 'shopName' + i,
      companyName: '株式会社リファクト',
      address:
        i % 2
          ? '〒113-0033\n東京都文京区本郷３丁目４０−３ トーセービル 4階'
          : '〒060-0002\n北海道札幌市中央区北二条西三丁目 札幌北2条ビル 8階 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      status: i % 2 ? '利用可能' : i % 3 ? '利用可能' : '利用停止',
    });
  }
  return result;
}

export function MockDataCreate_CompanySearchResult() {
  const result: CompanySearchResult[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: i.toString(),
      companyName: '株式会社リファクト',
      branchName: i % 2 ? '本郷事業所' : '札幌事業所',
      address:
        i % 2
          ? '〒113-0033\n東京都文京区本郷３丁目４０−３ トーセービル 4階'
          : '〒060-0002\n北海道札幌市中央区北二条西三丁目 札幌北2条ビル 8階 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      status: i % 2 ? '利用可能' : i % 3 ? '利用可能' : '利用停止',
    });
  }
  return result;
}
