import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CurrencyRate } from '@/types';

const NBRB_API_BASE = 'https://www.nbrb.by/api/exrates/rates';
/** 6 основных валют НБРБ: ID валюты → код (для запасного запроса по ID) */
const MAIN_CURRENCY_IDS: { id: number; code: string }[] = [
  { id: 431, code: 'USD' },
  { id: 451, code: 'EUR' },
  { id: 456, code: 'RUB' },
  { id: 452, code: 'PLN' },
  { id: 449, code: 'GBP' },
  { id: 426, code: 'CHF' },
];

async function fetchRatesByIds(ondate?: string): Promise<CurrencyRate[]> {
  const results = await Promise.all(
    MAIN_CURRENCY_IDS.map(async ({ id }) => {
      let url = `${NBRB_API_BASE}/${id}`;
      if (ondate) url += `?ondate=${ondate}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      return res.json() as Promise<CurrencyRate | null>;
    })
  );
  const rates = results.filter((r): r is CurrencyRate => r != null && Boolean(r.Cur_Abbreviation));
  return rates.sort((a, b) => {
    const ai = MAIN_CURRENCY_IDS.findIndex((c) => c.code === a.Cur_Abbreviation);
    const bi = MAIN_CURRENCY_IDS.findIndex((c) => c.code === b.Cur_Abbreviation);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isAdmin = session.user?.role === 'admin';
    const isPremium = session.user?.subscription_status === 'premium';
    if (!isAdmin && !isPremium) {
      return NextResponse.json(
        { error: 'Курсы валют доступны только премиум и администраторам' },
        { status: 403 }
      );
    }

    const dateParam = request.nextUrl.searchParams.get('date');
    const ondate =
      dateParam && !isNaN(new Date(dateParam).getTime())
        ? new Date(dateParam).toISOString().slice(0, 10)
        : undefined;

    let rates: CurrencyRate[];

    try {
      let url = `${NBRB_API_BASE}?periodicity=0`;
      if (ondate) url += `&ondate=${ondate}`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });
      if (!response.ok) throw new Error('NBRB API error');
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data as { rates?: CurrencyRate[] }).rates ?? [];
      const mainCodes = MAIN_CURRENCY_IDS.map((c) => c.code);
      const filtered = list.filter(
        (r: CurrencyRate) => r && r.Cur_Abbreviation && mainCodes.includes(r.Cur_Abbreviation)
      );
      if (filtered.length >= 6) {
        filtered.sort((a, b) => {
          const ai = mainCodes.indexOf(a.Cur_Abbreviation);
          const bi = mainCodes.indexOf(b.Cur_Abbreviation);
          return ai - bi;
        });
        rates = filtered.slice(0, 6);
      } else {
        rates = await fetchRatesByIds(ondate);
      }
    } catch {
      rates = await fetchRatesByIds(ondate);
    }

    if (rates.length === 0) {
      return NextResponse.json(
        { error: 'Не удалось загрузить курсы НБРБ' },
        { status: 502 }
      );
    }

    const date = rates[0]?.Date ?? (ondate ? `${ondate}T12:00:00.000Z` : new Date().toISOString());
    return NextResponse.json({ rates, date });
  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить курсы валют' },
      { status: 500 }
    );
  }
}
