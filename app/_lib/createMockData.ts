import {
  SearchResult_CompanyList,
  SearchResult_orderList,
  SearchResult_ScheduleList,
  SearchResult_ShopList,
  SearchResult_UserList,
} from './supabase/types';

/* 検索結果のモックデータ作成 */
export function MockDataCreate_UserResult() {
  const result: SearchResult_UserList[] = [];
  for (let i = 0; i < 30; i++) {
    result.push({
      id: 'id' + i.toString().padStart(4, '0'),
      user_name: 'userName' + i,
      t_companies_id: i.toString(),
      t_companies: {
        company_name:
          i % 2
            ? '株式会社リファクト'
            : i % 3
              ? '株式会社エブリイホーミイホールディングス'
              : '株式会社YPYエデュケーション',
      },
      user_name_kana: 'ユーザーネーム' + i,
    });
  }
  return result;
}

export function MockDataCreate_OrderResult() {
  const result: SearchResult_orderList[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: 'id' + i.toString().padStart(4, '0'),
      delivery_day: '2025/4/' + i,
      user_name: 'userName' + i,
      company_name:
        i % 2
          ? '株式会社リファクト'
          : i % 3
            ? '株式会社エブリイホーミイホールディングス'
            : '株式会社YPYエデュケーション',
      amount: 100 + i,
      count: i,
      payment_state: i % 2 ? '0' : i % 3 ? '1' : '2',
    });
  }
  return result;
}

export function MockDataCreate_ScheduleResult() {
  const result: SearchResult_ScheduleList[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: 'id' + i.toString().padStart(4, '0'),
      delivery_day: '2025/4/' + i,
      company_name: '株式会社リファクト',
      shop_name: i % 2 ? '本郷事業所' : '札幌事業所',
      menu_name: i % 2 ? 'チキンカレー' : i % 3 ? 'マッサマンカレー' : 'ビーフカレー',
      count: i,
      allergies: i % 2 ? ['ごま', '卵', '乳', '落花生', '大豆'] : i % 3 ? ['えび', 'かに'] : [],
    });
  }
  return result;
}

export function MockDataCreate_ShopSearchResult() {
  const result: SearchResult_ShopList[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: 'id' + i.toString().padStart(4, '0'),
      shop_name: 'shopName' + i,
      address:
        i % 2
          ? '〒113-0033\n東京都文京区本郷３丁目４０−３ トーセービル 4階'
          : '〒060-0002\n北海道札幌市中央区北二条西三丁目 札幌北2条ビル 8階 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      usage_state: i % 2 ? '0' : i % 3 ? '1' : '2',
      shop_post_code: i % 2 ? '113-0033' : '060-0002',
    });
  }
  return result;
}

export function MockDataCreate_CompanySearchResult() {
  const result: SearchResult_CompanyList[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: 'id' + i.toString().padStart(4, '0'),
      company_name: '株式会社リファクト',
      branch_name: i % 2 ? '本郷事業所' : '札幌事業所',
      post_code: i % 2 ? '113-0033' : '060-0002',
      prefectures:
        i % 2
          ? '東京都文京区本郷３丁目４０−３ トーセービル 4階'
          : '北海道札幌市中央区北二条西三丁目 札幌北2条ビル 8階 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      usage_state: i % 2 ? '利用可能' : i % 3 ? '利用可能' : '利用停止',
      area_block_number: '',
      building_name: '',
      municipalities: '',
      town_area: '',
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
