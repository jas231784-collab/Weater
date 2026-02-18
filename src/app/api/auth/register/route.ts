import { NextRequest, NextResponse } from 'next/server';
import { signUpWithEmail } from '@/lib/auth';
import { getSiteUrl } from '@/lib/supabase/url';

export async function POST(request: NextRequest) {
  const baseUrl = getSiteUrl().replace(/\/$/, '') || 'http://localhost:3000';
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    const callbackUrl = typeof body.callbackUrl === 'string' ? body.callbackUrl : '/dashboard';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      );
    }

    const { user } = await signUpWithEmail(email, password, { name });
    const redirectTo = callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`;
    return NextResponse.json({
      url: `${baseUrl}${redirectTo}`,
      needsConfirmation: !!user && !user.email_confirmed_at,
    });
  } catch (error) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка регистрации';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
