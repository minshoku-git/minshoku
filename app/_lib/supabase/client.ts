import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL_DEV!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_DEV!;

  return createBrowserClient(supabaseUrl, supabaseAnonKey, { db: { schema: process.env.SUPABASE_DB_SCHEMA } });
};
