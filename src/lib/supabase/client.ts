import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';
import { getSupabaseAnonKey } from './keys';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseAnonKey()
  );
}
