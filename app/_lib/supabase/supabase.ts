import { createClient } from '@supabase/supabase-js';

// クライアント側で環境変数を使用する場合は、プレフィックスとして「NEXT_PUBLIC_」が必要。
// NULLの場合があると警告が出るため、末尾に！マークを付けてエラーを回避する
// Create a single supabase client for interacting with your database
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
