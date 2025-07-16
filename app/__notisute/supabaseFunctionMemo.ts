// import { createClient } from '../_lib/supabase/server';
// import { ApiRequest, ApiResponse } from '../_types/types';
// import { CompanyDetailFormValues } from '../(private)/companyDetail/[id]/_lib/types';

// /* 会社詳細  没内容
// ------------------------------------------------------------------ */

// /**
//  * insert_companyDetail
//  * 会社情報を新規登録する。
//  *
//  * @param {ApiRequest<CompanyDetailFormValues>} values - 入力情報
//  * @returns {Promise<ApiResponse<number>>} 新規登録した会社情報ID
//  */
// export const insert_companyDetail_BOTU = async (
//   values: ApiRequest<CompanyDetailFormValues>
// ): Promise<ApiResponse<number>> => {
//   const supabase = await createClient();
//   const req = values.request;

//   const { data: testData, error: testError } = await supabase.rpc('testtest', {
//     departments: ['てすと'], // trigger_errorを加えるとエラーを発生させることができます
//     employment_status: [],
//     t_companies: {
//       company_name: req.company_name,
//       branch_name: req.branch_name,
//       postal_code: req.postal_code,
//       prefectures: req.prefectures,
//       municipalities: req.municipalities,
//       town_area: req.town_area,
//       area_block_number: req.area_block_number,
//       building_name: req.building_name,
//       restaurant_name: req.restaurant_name,
//       location: req.location,
//       email: req.email,
//       memo: req.memo,
//       usage_state: 0,
//       optional_item_title_1: req.optional_item_title_1,
//       optional_item_title_2: req.optional_item_title_2,
//       optional_item_notes_1: req.optional_item_notes_1,
//       optional_item_notes_2: req.optional_item_notes_2,
//       url_key: '', // TODO: 仕様確定待ち
//       offer_time_from: req.offer_time_from,
//       offer_time_to: req.offer_time_to,
//       order_period_day: Number(req.order_period_day),
//       order_period_time: req.order_period_time,
//       cancel_period_day: Number(req.cancel_period_day),
//       cancel_period_time: req.order_period_time,
//     },
//   });

//   // const query = supabase
//   //   .from('t_companies')
//   //   .insert<t_companies>({
//   //     // MEMO:id:praimaryKeyなので自動追加
//   //     company_name: req.company_name,
//   //     branch_name: req.branch_name,
//   //     postal_code: req.postal_code,
//   //     prefectures: req.prefectures,
//   //     municipalities: req.municipalities,
//   //     town_area: req.town_area,
//   //     area_block_number: req.area_block_number,
//   //     building_name: req.building_name,
//   //     restaurant_name: req.restaurant_name,
//   //     email: req.email,
//   //     memo: req.memo,
//   //     usage_state: 0, // TODO: 企業新規登録時、何を設定したらいいのか要確認。
//   //     optional_item_title_1: req.optional_item_title_1,
//   //     optional_item_title_2: req.optional_item_title_2,
//   //     optional_item_notes_1: req.optional_item_notes_1,
//   //     optional_item_notes_2: req.optional_item_notes_2,
//   //     url_key: '', // TODO: 企業新規登録時、何を設定したらいいのか要確認。
//   //     offer_time_from: '00:00', // TODO:timeで管理する？文字列かnumberにする？
//   //     offer_time_to: '12:00', // TODO:timeで管理する？文字列かnumberにする？
//   //     order_period_day: Number(req.order_period_day),
//   //     order_period_hour: Number(req.order_period_hour),
//   //     order_period_minute: Number(req.order_period_minute),
//   //     cancel_period_day: Number(req.cancel_period_day),
//   //     cancel_period_hour: Number(req.cancel_period_hour),
//   //     cancel_period_minute: Number(req.cancel_period_minute),
//   //     // updated_at: timestamp,　// MEMO:自動でタイムスタンプ押される。
//   //     // created_at: timestamp,　// MEMO:自動でタイムスタンプ押される。
//   //   })
//   //   .select('id')
//   //   .single();
//   // const { error, data } = (await query) as PostgrestSingleResponse<t_companies>;

//   // 企業雇用形態の新規登録

//   console.log(testData);
//   console.log(testError?.message);

//   return {
//     data: (testData as number) ?? null,
//     error: testError ? testError.message : null,
//   };

//   // return {
//   //   data: data?.id ? data.id : 0,
//   //   error: error ? error.message : null,
//   // };
// };
