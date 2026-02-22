import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';
import { getSiteUrl } from '@/lib/supabase/url';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const baseUrl = getSiteUrl().replace(/\/$/, '');

  await signOut();
  return NextResponse.redirect(
    `${baseUrl}${callbackUrl.startsWith('/') ? callbackUrl : '/' + callbackUrl}`
  );
}
