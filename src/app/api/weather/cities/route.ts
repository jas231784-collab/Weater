import { NextRequest, NextResponse } from 'next/server';

const WEATHERAPI_KEY = process.env.WEATHERAPI_API_KEY ?? process.env.WEATHERAPI_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

export interface CitySuggestion {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

type SearchItem = {
  id?: number;
  name?: string;
  city?: string;
  region?: string;
  country?: string;
  country_name?: string;
  lat?: number;
  lon?: number;
  geoname_id?: number | string;
};

function toSuggestions(list: unknown[]): CitySuggestion[] {
  return list.slice(0, 8).map((raw: unknown, index: number) => {
    const item = raw as SearchItem;
    const id = typeof item?.id === 'number' ? item.id
      : typeof item?.geoname_id === 'number' ? item.geoname_id
      : typeof item?.geoname_id === 'string' ? parseInt(item.geoname_id, 10) || index
      : index;
    const name = item?.name ?? item?.city ?? '';
    const region = item?.region ?? '';
    const country = item?.country ?? item?.country_name ?? '';
    const lat = typeof item?.lat === 'number' ? item.lat : 0;
    const lon = typeof item?.lon === 'number' ? item.lon : 0;
    return { id, name, region, country, lat, lon };
  });
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  if (!WEATHERAPI_KEY) {
    return NextResponse.json(
      { error: 'Weather API key not configured' },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE_URL}/search.json?key=${encodeURIComponent(WEATHERAPI_KEY)}&q=${encodeURIComponent(q)}`;
    const response = await fetch(url, { next: { revalidate: 60 } });
    const data = await response.json();

    if (!response.ok) {
      const err = data as { error?: { message?: string } };
      throw new Error(err?.error?.message ?? 'Search failed');
    }

    const list = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray((data as { locations?: unknown[] }).locations) ? (data as { locations: unknown[] }).locations : []);
    const suggestions = toSuggestions(list);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Weather cities search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search cities' },
      { status: 500 }
    );
  }
}
