import { CompanyListSearchResult } from '../(private)/company/_lib/types';
import { OrderListSearchResult } from '../(private)/order/_lib/types';
import { ScheduleData, ScheduleListSearchResult } from '../(private)/schedule/_lib/types';
import { ShopListSearchResult } from '../(private)/shop/_lib/types';
import { UserListSearchResult } from '../(private)/user/_lib/types';

/* 検索結果のモックデータ作成 */
export function MockDataCreate_UserResult() {
  const result: UserListSearchResult[] = [];
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
        branch_name: i % 2 ? '本郷事業所' : i % 3 ? 'XXXX支店' : 'OOOO支店',
      },
      user_name_kana: 'ユーザーネーム' + i,
      user_registration_status: '',
    });
  }
  return result;
}

export function MockDataCreate_OrderResult() {
  const result: OrderListSearchResult[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: 'id' + i.toString().padStart(4, '0'),
      delivery_day: '2025/04/' + i.toString().padStart(2, '0'),
      user_name_kana: 'userName' + i,
      company_name:
        i % 2
          ? '株式会社リファクト'
          : i % 3
            ? '株式会社エブリイホーミイホールディングス'
            : '株式会社YPYエデュケーション',
      branch_name: i % 2 ? '本郷事業所' : i % 3 ? 'XXXX支店' : 'OOOO支店',
      count: i,
      payment_state: i % 2 ? '0' : i % 3 ? '1' : '2',
      order_status: i % 2 ? 0 : i % 3 ? 1 : 2,
    });
  }
  return result;
}

export function MockDataCreate_ScheduleResult() {
  const data: ScheduleData[] = [];

  for (let i = 1; i <= 30; i++) {
    data.push({
      id: 'id' + i.toString().padStart(4, '0'),
      delivery_day: '2025/04/' + i.toString().padStart(2, '0'),
      company_name:
        i % 2
          ? '株式会社リファクト'
          : i % 3
            ? '株式会社エブリイホーミイホールディングス'
            : '株式会社YPYエデュケーション',
      branch_name: i % 2 ? '本郷事業所' : i % 3 ? 'XXXX支店' : 'OOOO支店',
      shop_name: i % 2 ? 'COCO壱' : 'XXXXXXXXXX',
      menu_name: i % 2 ? 'チキンカレー' : i % 3 ? 'マッサマンカレー' : 'ビーフカレー',
      order_count: i,
      allergen_labelling: i % 2 ? 'ごま, 卵, 乳, 落花生, 大豆' : i % 3 ? 'えび, かに' : '',
    });
  }

  const result: ScheduleListSearchResult = { orderAmout: 100, scheduleDatas: data };
  return result;
}

export function MockDataCreate_ShopSearchResult() {
  const result: ShopListSearchResult[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: 'id' + i.toString().padStart(4, '0'),
      shop_name: 'shopName' + i,
      address:
        i % 2
          ? '〒113-0033\n東京都文京区本郷３丁目４０−３ トーセービル 4階'
          : '〒060-0002\n北海道札幌市中央区北二条西三丁目 札幌北2条ビル 8階 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      usage_status: i % 2 ? '0' : i % 3 ? '1' : '2',
      shop_postal_code: i % 2 ? '113-0033' : '060-0002',
    });
  }
  return result;
}

export function MockDataCreate_CompanySearchResult() {
  const result: CompanyListSearchResult[] = [];
  for (let i = 1; i <= 30; i++) {
    result.push({
      id: 'id' + i.toString().padStart(4, '0'),
      company_name: '株式会社リファクト',
      branch_name: i % 2 ? '本郷事業所' : '札幌事業所',
      postal_code: i % 2 ? '113-0033' : '060-0002',
      prefectures:
        i % 2
          ? '東京都文京区本郷３丁目４０−３ トーセービル 4階'
          : '北海道札幌市中央区北二条西三丁目 札幌北2条ビル 8階 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      usage_status: i % 2 ? '利用可能' : i % 3 ? '利用可能' : '利用停止',
      area_block_number: '',
      building_name: '',
      municipalities: '',
      town_area: '',
    });
  }
  return result;
}

export const MOCKDATA_departmentInfo: DepartmentData[] = [
  { id: 'dep1', name: '総務部', disabled: false, delete_flag: false },
  { id: 'dep2', name: '営業部', disabled: true, delete_flag: false },
];

export const MOCKDATA_employmentInfo: EmploymentData[] = [
  {
    id: 'emp1',
    employment_status_name: '正社員',
    deduction_flag: true,
    credit_flag: true,
    paypay_flag: true,
    set_meal_burden: '500',
    disabled: true,
    delete_flag: false,
  },
  {
    id: 'emp2',
    employment_status_name: 'アルバイト',
    deduction_flag: false,
    credit_flag: true,
    paypay_flag: true,
    set_meal_burden: '0',
    disabled: true,
    delete_flag: false,
  },
  {
    id: 'emp3',
    employment_status_name: 'パートタイム',
    deduction_flag: false,
    credit_flag: true,
    paypay_flag: true,
    set_meal_burden: '0',
    disabled: false,
    delete_flag: false,
  },
];

// 部署情報
export type DepartmentData = {
  // 部署ID
  id: string;
  // 部署名
  name: string;
  // 編集不可 ※true:編集不可(非活性),false:編集可能(活性)
  disabled: boolean;
  // 削除フラグ ※true:削除/false:有効
  delete_flag: boolean;
};

// 雇用種別情報
export type EmploymentData = {
  // 雇用種別ID
  id: string;
  // 雇用種別名
  employment_status_name: string;
  // 決済方法(控除)
  deduction_flag: boolean;
  // 決済方法(クレジットカード)
  credit_flag: boolean;
  // 決済方法(PayPay)
  paypay_flag: boolean;
  // 会社負担
  set_meal_burden: string;
  // 編集不可 ※true:編集不可(非活性),false:編集可能(活性)
  disabled: boolean;
  // 削除フラグ ※true:削除/false:有効
  delete_flag: boolean;
};
