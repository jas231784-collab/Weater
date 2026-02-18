import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  await signOut();
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${callbackUrl.startsWith('/') ? callbackUrl : '/' + callbackUrl}`
  );
}
