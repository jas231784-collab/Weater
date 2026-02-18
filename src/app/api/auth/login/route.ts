import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmail } from '@/lib/auth';
import { getSiteUrl } from '@/lib/supabase/url';

export async function POST(request: NextRequest) {
  const baseUrl = getSiteUrl().replace(/\/$/, '') || 'http://localhost:3000';
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const callbackUrl = typeof body.callbackUrl === 'string' ? body.callbackUrl : '/dashboard';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    await signInWithEmail(email, password);
    const redirectTo = callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`;
    return NextResponse.json({ url: `${baseUrl}${redirectTo}` });
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка входа';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
