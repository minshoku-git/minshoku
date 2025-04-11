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
      id: 'id' + i.toString().padStart(4, '0'),
      userName: 'userName' + i + ' / ユーザーネーム' + i,
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
      id: 'id' + i.toString().padStart(4, '0'),
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
      id: 'id' + i.toString().padStart(4, '0'),
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
      id: 'id' + i.toString().padStart(4, '0'),
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
      id: 'id' + i.toString().padStart(4, '0'),
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

export const MOCKDATA_departmentInfo: DepartmentData[] = [
  { id: 'dep1', name: '総務部', disabled: false },
  { id: 'dep2', name: '営業部', disabled: true },
];

export const MOCKDATA_employmentInfo: EmploymentData[] = [
  {
    id: 'emp1',
    name: '正社員',
    isDeduction: true,
    isCreditCard: true,
    isPayPay: true,
    burdenAmount: '500',
    disabled: true,
  },
  {
    id: 'emp2',
    name: 'アルバイト',
    isDeduction: false,
    isCreditCard: true,
    isPayPay: true,
    burdenAmount: '0',
    disabled: true,
  },
  {
    id: 'emp3',
    name: 'パートタイム',
    isDeduction: false,
    isCreditCard: true,
    isPayPay: true,
    burdenAmount: '0',
    disabled: false,
  },
];

// 部署情報
export type DepartmentData = {
  // 部署ID
  id: string;
  // 部署名
  name: string;
  // 編集不可 true:編集不可(非活性),false:編集可能(活性)
  disabled: boolean;
};

// 雇用種別情報
export type EmploymentData = {
  // 雇用種別ID
  id: string;
  // 雇用種別名
  name: string;
  // 決済方法(控除)
  isDeduction: boolean;
  // 決済方法(クレジットカード)
  isCreditCard: boolean;
  // 決済方法(PayPay)
  isPayPay: boolean;
  // 会社負担
  burdenAmount: string;
  // 編集不可 true:編集不可(非活性),false:編集可能(活性)
  disabled: boolean;
};
