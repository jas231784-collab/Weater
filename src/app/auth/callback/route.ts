import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSiteUrl } from '@/lib/supabase/url';
import type { Database } from '@/types/database';

type UserInsert = Database['public']['Tables']['users']['Insert'];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const code = searchParams.get('code');
  const next = searchParams.get('next')?.replace(/^\//, '') || 'dashboard';
  const origin = url.origin || getSiteUrl().replace(/\/$/, '') || 'http://localhost:3000';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?error=missing_code`);
  }

  let authData: { user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } };
  try {
    const supabase = await createClient();
    const result = await supabase.auth.exchangeCodeForSession(code);
    if (result.error) {
      console.error('Auth callback error:', result.error);
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(result.error.message)}`);
    }
    authData = result.data;
  } catch (err) {
    console.error('Auth callback exception:', err);
    return NextResponse.redirect(`${origin}/auth/error?error=server_error`);
  }

  const authUser = authData.user;
  if (authUser && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes(authUser.email?.toLowerCase() ?? '');

    try {
      const adminClient = createAdminClient();
      const { data: existing } = await adminClient
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (!existing) {
        const meta = authUser.user_metadata ?? {};
        const name = (meta.full_name ?? meta.name) as string | null;
        const image = (meta.avatar_url ?? meta.picture) as string | null;
        const userData: UserInsert = {
          id: authUser.id,
          email: authUser.email!.toLowerCase(),
          name: name ?? null,
          image: image ?? null,
          subscription_status: 'free',
          role: isAdmin ? 'admin' : 'user',
          blocked: false,
        };
        // @ts-ignore - Supabase insert type inference
        await adminClient.from('users').insert(userData);
      }
    } catch (err) {
      console.error('User sync error:', err);
    }
  }

  return NextResponse.redirect(`${origin}/${next}`);
}
