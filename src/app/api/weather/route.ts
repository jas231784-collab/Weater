import { NextRequest, NextResponse } from 'next/server';
import { WeatherData, DailyForecast } from '@/types';

const WEATHERAPI_KEY = process.env.WEATHERAPI_API_KEY ?? process.env.WEATHERAPI_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

interface WeatherAPIError {
  error?: { code?: number; message?: string };
}

interface WeatherAPICurrent {
  temp_c: number;
  feelslike_c: number;
  humidity: number;
  pressure_mb: number;
  wind_kph: number;
  wind_degree: number;
  condition: { text: string; icon: string; code: number };
  last_updated_epoch: number;
}

interface WeatherAPILocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
}

interface WeatherAPIForecastDay {
  date: string;
  date_epoch: number;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: { text: string; icon: string; code: number };
    maxwind_kph: number;
    avghumidity: number;
  };
  astro: { sunrise: string; sunset: string };
}

interface WeatherAPIForecastResponse {
  location: WeatherAPILocation;
  current: WeatherAPICurrent;
  forecast?: { forecastday: WeatherAPIForecastDay[] };
}

function ensureHttpsIcon(icon: string): string {
  if (icon.startsWith('//')) return `https:${icon}`;
  if (icon.startsWith('http')) return icon;
  return `https://cdn.weatherapi.com/weather/64x64/day/${icon}.png`;
}

function mapToWeatherData(loc: WeatherAPILocation, current: WeatherAPICurrent): WeatherData {
  return {
    name: loc.name,
    main: {
      temp: current.temp_c,
      feels_like: current.feelslike_c,
      humidity: current.humidity,
      pressure: Math.round(current.pressure_mb),
      temp_min: current.temp_c,
      temp_max: current.temp_c,
    },
    weather: [
      {
        id: current.condition.code,
        main: current.condition.text,
        description: current.condition.text,
        icon: ensureHttpsIcon(current.condition.icon),
      },
    ],
    wind: {
      speed: current.wind_kph / 3.6,
      deg: current.wind_degree,
    },
    sys: {
      country: loc.country,
      sunrise: 0,
      sunset: 0,
    },
    coord: { lat: loc.lat, lon: loc.lon },
    dt: current.last_updated_epoch,
    timezone: 0,
  };
}

function mapToDailyForecast(days: WeatherAPIForecastDay[]): DailyForecast[] {
  return days.slice(0, 7).map((d) => {
    const dayDate = new Date(d.date);
    return {
      date: d.date,
      dayName: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
      temp_min: d.day.mintemp_c,
      temp_max: d.day.maxtemp_c,
      icon: ensureHttpsIcon(d.day.condition.icon),
      description: d.day.condition.text,
      humidity: d.day.avghumidity,
      wind_speed: d.day.maxwind_kph / 3.6,
    };
  });
}

async function fetchWeather(
  q: string,
  days: number
): Promise<WeatherAPIForecastResponse> {
  const url = `${BASE_URL}/forecast.json?key=${encodeURIComponent(WEATHERAPI_KEY!)}&q=${encodeURIComponent(q)}&days=${days}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const err: WeatherAPIError = data;
    const message =
      err.error?.message ?? (typeof data === 'object' && data.error ? String(data.error) : 'Weather request failed');
    throw new Error(message);
  }

  return data as WeatherAPIForecastResponse;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const needForecast = searchParams.get('forecast') !== 'false';

    if (!WEATHERAPI_KEY) {
      return NextResponse.json(
        { error: 'Weather API key not configured. Set WEATHERAPI_API_KEY or WEATHERAPI_KEY.' },
        { status: 500 }
      );
    }

    const q = city ? city : lat && lon ? `${lat},${lon}` : null;
    if (!q) {
      return NextResponse.json(
        { error: 'Please provide city name or coordinates (lat, lon)' },
        { status: 400 }
      );
    }

    const days = needForecast ? 7 : 1;
    const data = await fetchWeather(q, days);

    const current = mapToWeatherData(data.location, data.current);
    const response: { current: WeatherData; forecast?: DailyForecast[] } = {
      current,
    };

    if (needForecast && data.forecast?.forecastday?.length) {
      response.forecast = mapToDailyForecast(data.forecast.forecastday);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
