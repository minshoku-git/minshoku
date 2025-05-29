import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { supabase } from '../_lib/supabase/supabase';

/* テスト用に作成した関数 ※のちすて
------------------------------------------------------------------ */
export type Todo = {
  id: number;
  title: string;
  isFlag: boolean;
};

export const getAllTodo = async () => {
  const todos: PostgrestSingleResponse<Todo[]> = await supabase.from('todo').select('*');
  return todos.data;
};

export const getAllTodoName = async () => {
  const todos: PostgrestSingleResponse<Pick<Todo, 'title'>[]> = await supabase.from('todo').select('title');
  return todos.data;
};
