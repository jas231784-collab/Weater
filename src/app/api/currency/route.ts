import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CurrencyRate } from '@/types';

const NBRB_API_BASE = 'https://www.nbrb.by/api/exrates/rates';

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
        { error: 'Currency rates are available for admins and premium users only' },
        { status: 403 }
      );
    }

    const dateParam = request.nextUrl.searchParams.get('date');
    let url = `${NBRB_API_BASE}?periodicity=0`;
    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        const ondate = date.toISOString().slice(0, 10);
        url += `&ondate=${ondate}`;
      }
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch currency rates');
    }

    const data: CurrencyRate[] = await response.json();
    
    const majorCurrencies = ['USD', 'EUR', 'RUB', 'PLN', 'GBP', 'CHF', 'CNY', 'CZK', 'UAH', 'TRY'];
    
    const filteredData = data.filter(rate => majorCurrencies.includes(rate.Cur_Abbreviation));
    
    filteredData.sort((a, b) => {
      const aIndex = majorCurrencies.indexOf(a.Cur_Abbreviation);
      const bIndex = majorCurrencies.indexOf(b.Cur_Abbreviation);
      return aIndex - bIndex;
    });

    return NextResponse.json({
      rates: filteredData,
      date: filteredData[0]?.Date ?? (dateParam ? `${dateParam}T12:00:00.000Z` : new Date().toISOString()),
    });
  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency rates' },
      { status: 500 }
    );
  }
}
