import { t_menu_schedule } from '@/app/_lib/supabase/tableTypes';

/** スケジュールテーブル */
export type scheduleCsvValues = Omit<t_menu_schedule, 'created_at' | 'updated_at'>;
