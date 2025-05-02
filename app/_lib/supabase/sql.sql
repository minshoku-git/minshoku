-- 試し書き,実際にはこちらは全く読み取られない。。。

-- 最初に必要なカスタム型の定義（変更なし）
CREATE TYPE company_insert_type AS (
  company_name TEXT,
  branch_name TEXT,
  post_code TEXT,
  prefectures TEXT,
  municipalities TEXT,
  town_area TEXT,
  area_block_number TEXT,
  building_name TEXT,
  restaurant_name TEXT,
  mailaddress TEXT,
  memo TEXT,
  usage_state INTEGER,
  optional_item_title_1 TEXT,
  optional_item_title_2 TEXT,
  optional_item_notes_1 TEXT,
  optional_item_notes_2 TEXT,
  url_key TEXT,
  offer_time_from TEXT,
  offer_time_to TEXT,
  order_period_day INTEGER,
  order_period_hour INTEGER,
  order_period_minute INTEGER,
  cancel_period_day INTEGER,
  cancel_period_hour INTEGER,
  cancel_period_minute INTEGER
);

-- insert_company 関数の作成
CREATE OR REPLACE FUNCTION insert_company(t_company company_insert_type)
RETURNS INTEGER AS $$
DECLARE
  new_company_id INTEGER;
BEGIN
  -- t_companies テーブルへの INSERT（idとcreated_atは自動で追加される）
  INSERT INTO t_companies (
    company_name,
    branch_name,
    post_code,
    prefectures,
    municipalities,
    town_area,
    area_block_number,
    building_name,
    restaurant_name,
    mailaddress,
    memo,
    usage_state,
    optional_item_title_1,
    optional_item_title_2,
    optional_item_notes_1,
    optional_item_notes_2,
    url_key,
    offer_time_from,
    offer_time_to,
    order_period_day,
    order_period_hour,
    order_period_minute,
    cancel_period_day,
    cancel_period_hour,
    cancel_period_minute
  ) VALUES (
    t_company.company_name,
    t_company.branch_name,
    t_company.post_code,
    t_company.prefectures,
    t_company.municipalities,
    t_company.town_area,
    t_company.area_block_number,
    t_company.building_name,
    t_company.restaurant_name,
    t_company.mailaddress,
    t_company.memo,
    t_company.usage_state,
    t_company.optional_item_title_1,
    t_company.optional_item_title_2,
    t_company.optional_item_notes_1,
    t_company.optional_item_notes_2,
    t_company.url_key,
    t_company.offer_time_from,
    t_company.offer_time_to,
    t_company.order_period_day,
    t_company.order_period_hour,
    t_company.order_period_minute,
    t_company.cancel_period_day,
    t_company.cancel_period_hour,
    t_company.cancel_period_minute
  )
  RETURNING id INTO new_company_id;

  

  -- t_companies_department テーブルへの INSERT（idとcreated_atは自動で追加される）
  INSERT INTO t_companies_department (
    t_companies_id,
    department_name,
    delete_flag,
  ) VALUES ({new_company_id,
    "部署名",
    0}
    
  )

  -- 新しく挿入された会社IDを返す
  RETURN new_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
