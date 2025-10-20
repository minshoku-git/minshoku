import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(process.env.SUPABASE_URL_DEV!, process.env.SUPABASE_ANON_DEV!, {
    db: { schema: process.env.SUPABASE_DB_SCHEMA },
  });
