CREATE OR REPLACE FUNCTION your_function_name(
  t_companies jsonb,
  departments text[],
  employment_status text[]
)
RETURNS integer AS $$
DECLARE
  new_id integer;
  dept text;
BEGIN
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
    location,
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
    t_companies->>'company_name',
    t_companies->>'branch_name',
    t_companies->>'post_code',
    t_companies->>'prefectures',
    t_companies->>'municipalities',
    t_companies->>'town_area',
    t_companies->>'area_block_number',
    t_companies->>'building_name',
    t_companies->>'restaurant_name',
    t_companies->>'location',
    t_companies->>'mailaddress',
    'ソースだよ',
    0,
    t_companies->>'optional_item_title_1',
    t_companies->>'optional_item_title_2',
    t_companies->>'optional_item_notes_1',
    t_companies->>'optional_item_notes_2',
    '',
    current_timestamp,
    current_timestamp,
    (t_companies->>'order_period_day')::int,
    (t_companies->>'order_period_hour')::int,
    (t_companies->>'order_period_minute')::int,
    (t_companies->>'cancel_period_day')::int,
    (t_companies->>'cancel_period_hour')::int,
    (t_companies->>'cancel_period_minute')::int
  )
  RETURNING id INTO new_id;

  IF new_id IS NULL THEN
    RAISE EXCEPTION 'Failed to insert company, new_id is NULL';
  END IF;

  FOREACH dept IN ARRAY departments LOOP
    INSERT INTO t_companies_department (
      t_companies_id,
      department_name,
      delete_flag
    )
    VALUES (
      new_id,
      dept,
      0
    );
  END LOOP;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;
