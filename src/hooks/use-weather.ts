"use client";

import { useState, useCallback } from 'react';
import { WeatherData, DailyForecast } from '@/types';

interface WeatherResult {
  current: WeatherData;
  forecast: DailyForecast[];
}

interface WeatherState {
  data: WeatherResult | null;
  loading: boolean;
  error: string | null;
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchWeather = useCallback(async (city?: string, lat?: number, lon?: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (lat !== undefined) params.set('lat', lat.toString());
      if (lon !== undefined) params.set('lon', lon.toString());
      params.set('forecast', 'true');

      const response = await fetch(`/api/weather?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather');
      }

      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch weather';
      setState({ data: null, loading: false, error: message });
      throw error;
    }
  }, []);

  const fetchByGeolocation = useCallback(() => {
    return new Promise<WeatherResult>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await fetchWeather(
              undefined,
              position.coords.latitude,
              position.coords.longitude
            );
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          let message = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          setState(prev => ({ ...prev, loading: false, error: message }));
          reject(new Error(message));
        }
      );
    });
  }, [fetchWeather]);

  const clear = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    fetchWeather,
    fetchByGeolocation,
    clear,
  };
}
