import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';
import { getSiteUrl } from '@/lib/supabase/url';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const next = callbackUrl.replace(/^\//, '') || 'dashboard';
  const baseUrl = getSiteUrl().replace(/\/$/, '') || 'http://localhost:3000';

  try {
    const url = await signIn(next);
    if (url) {
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('Sign in error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(
      `${baseUrl}/auth/error?error=${encodeURIComponent(message)}`
    );
  }
  return NextResponse.redirect(`${baseUrl}/auth/error?error=no_redirect_url`);
}
