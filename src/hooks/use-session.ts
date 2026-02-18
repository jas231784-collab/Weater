'use client';

import { useCallback, useEffect, useState } from 'react';

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

function fetchSession(): Promise<Session | null> {
  return fetch('/api/auth/session')
    .then((res) => res.json())
    .then((data) => (data?.user ? data : null))
    .catch(() => null);
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const refetch = useCallback(() => {
    return fetchSession().then((data) => {
      setSession(data);
      setStatus(data?.user ? 'authenticated' : 'unauthenticated');
      return data;
    });
  }, []);

  useEffect(() => {
    fetchSession().then((data) => {
      setSession(data);
      setStatus(data?.user ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  const signOut = (options?: { callbackUrl?: string }) => {
    const url = options?.callbackUrl
      ? `/api/auth/signout?callbackUrl=${encodeURIComponent(options.callbackUrl)}`
      : '/api/auth/signout?callbackUrl=/';
    window.location.href = url;
  };

  return { data: session, status, signOut, refetch };
}
