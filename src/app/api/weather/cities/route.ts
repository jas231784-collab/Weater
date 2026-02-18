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
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const err = data as { error?: { message?: string } };
      throw new Error(err?.error?.message ?? 'Search failed');
    }

    const list = Array.isArray(data) ? data : [];
    const suggestions: CitySuggestion[] = list.slice(0, 8).map((item: { id: number; name: string; region: string; country: string; lat: number; lon: number }) => ({
      id: item.id,
      name: item.name,
      region: item.region || '',
      country: item.country || '',
      lat: item.lat,
      lon: item.lon,
    }));

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Weather cities search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search cities' },
      { status: 500 }
    );
  }
}
