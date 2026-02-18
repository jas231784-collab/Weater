import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/url';
import type { Database } from '@/types/database';
type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: 'user' | 'admin';
  subscription_status: 'free' | 'premium';
  subscription_end?: string | null;
}

export interface Session {
  user: SessionUser;
}

async function syncUserToDb(authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): Promise<UserRow | null> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes((authUser.email ?? '').toLowerCase());
    const userData: UserInsert = {
      id: authUser.id,
      email: (authUser.email ?? '').toLowerCase(),
      name: (authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null) as string | null,
      image: (authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? null) as string | null,
      subscription_status: 'free',
      role: isAdmin ? 'admin' : 'user',
      blocked: false,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase upsert generic inference can resolve to never
    await adminClient.from('users').upsert(userData as any, { onConflict: 'id' });
    const { data } = await adminClient.from('users').select('*').eq('id', authUser.id).single();
    return data as UserRow | null;
  } catch {
    return null;
  }
}

export async function auth(): Promise<Session | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  const { data: dbUserData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  let user: UserRow | null = dbUserData as UserRow | null;
  if (!user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    user = await syncUserToDb(authUser);
  }
  if (!user || user.blocked) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      subscription_status: user.subscription_status,
      subscription_end: user.subscription_end,
    },
  };
}

export async function signIn(redirectTo = '/dashboard') {
  const supabase = await createClient();
  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const redirectToUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo.replace(/^\//, ''))}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectToUrl },
  });
  if (error) throw error;
  return data.url;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  options?: { name?: string }
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: options?.name ? { full_name: options.name } : undefined,
    },
  });
  if (error) throw error;
  return data;
}
