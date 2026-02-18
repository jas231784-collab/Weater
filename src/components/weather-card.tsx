"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherData, DailyForecast } from "@/types";
import {
  Droplets,
  Wind,
  Gauge,
  MapPin,
  Thermometer,
  Sunrise,
  Sunset,
} from "lucide-react";

interface WeatherCardProps {
  data: WeatherData | null;
  forecast: DailyForecast[] | null;
  loading: boolean;
  isPremium: boolean;
}

function WeatherIcon({ iconCode }: { iconCode: string }) {
  const src =
    iconCode.startsWith('http') || iconCode.startsWith('//')
      ? iconCode.startsWith('//')
        ? `https:${iconCode}`
        : iconCode
      : `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  return (
    <img
      src={src}
      alt="Weather icon"
      className="w-16 h-16"
    />
  );
}

function formatTime(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function WeatherCard({ data, forecast, loading, isPremium }: WeatherCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Enter a city name or use your location to get weather data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {data.name}, {data.sys.country}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <WeatherIcon iconCode={data.weather[0].icon} />
              <div>
                <div className="text-4xl font-bold">
                  {Math.round(data.main.temp)}°C
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  {data.weather[0].description}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <span>Feels: {Math.round(data.main.feels_like)}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <span>{data.main.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span>{Math.round(data.wind.speed)} m/s</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span>{data.main.pressure} hPa</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            {data.sys.sunrise > 0 && data.sys.sunset > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Sunrise className="h-4 w-4 text-orange-500" />
                  <span>Sunrise: {formatTime(data.sys.sunrise, data.timezone)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sunset className="h-4 w-4 text-orange-500" />
                  <span>Sunset: {formatTime(data.sys.sunset, data.timezone)}</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>H: {Math.round(data.main.temp_max)}°C</span>
              <span>L: {Math.round(data.main.temp_min)}°C</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isPremium ? "7-Day Forecast" : "5-Day Forecast"}
            {!isPremium && (
              <span className="text-xs text-muted-foreground ml-2">
                (Premium: 7 days)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {(isPremium ? forecast?.slice(0, 7) : forecast?.slice(0, 5))?.map((day, index) => (
              <div
                key={day.date}
                className={`text-center p-2 rounded-lg ${
                  index >= 5 && !isPremium
                    ? "opacity-50 relative"
                    : "bg-muted/50"
                }`}
              >
                {index >= 5 && !isPremium && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs bg-yellow-500 text-white px-1 rounded">
                      PRO
                    </span>
                  </div>
                )}
                <div className="text-sm font-medium">{day.dayName}</div>
                <img
                  src={
                    day.icon.startsWith('http') || day.icon.startsWith('//')
                      ? day.icon.startsWith('//')
                        ? `https:${day.icon}`
                        : day.icon
                      : `https://openweathermap.org/img/wn/${day.icon}.png`
                  }
                  alt={day.description}
                  className="w-10 h-10 mx-auto"
                />
                <div className="text-xs">
                  <span className="font-medium">{Math.round(day.temp_max)}°</span>
                  <span className="text-muted-foreground ml-1">
                    {Math.round(day.temp_min)}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
