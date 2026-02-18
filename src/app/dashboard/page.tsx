"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WeatherCard } from "@/components/weather-card";
import { CurrencyCard } from "@/components/currency-card";
import { useWeather } from "@/hooks/use-weather";
import { useCurrency } from "@/hooks/use-currency";
import { MapPin, Search, Loader2, Crown } from "lucide-react";
import Link from "next/link";

interface CitySuggestion {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

export default function DashboardPage() {
  const { data: session, refetch: refetchSession } = useSession();
  const isPremium = session?.user?.subscription_status === "premium";
  const isAdmin = session?.user?.role === "admin";
  const canSeeCurrency = isAdmin || isPremium;

  const weather = useWeather();
  const currency = useCurrency();

  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [citySuggestionsLoading, setCitySuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currencyDate, setCurrencyDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (canSeeCurrency) currency.fetchRates(currencyDate);
  }, [canSeeCurrency, currencyDate]);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (params.has("session_id")) {
      refetchSession().then(() => {
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.pathname + url.search);
        }
      });
    }
  }, [refetchSession]);

  useEffect(() => {
    if (weather.data || weather.loading) return;
    const loadInitialWeather = async () => {
      try {
        await weather.fetchByGeolocation();
      } catch {
        try {
          await weather.fetchWeather("London");
        } catch (e) {
          console.error("Initial weather load failed:", e);
        }
      }
    };
    loadInitialWeather();
  }, []);

  useEffect(() => {
    const q = cityInput.trim();
    if (q.length < 2) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCitySuggestionsLoading(true);
      fetch(`/api/weather/cities?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => {
          setCitySuggestions(Array.isArray(data) ? data : []);
          setShowSuggestions(Array.isArray(data) && data.length > 0);
        })
        .catch(() => setCitySuggestions([]))
        .finally(() => setCitySuggestionsLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [cityInput]);

  const handleSelectCity = useCallback(
    (suggestion: CitySuggestion) => {
      const label = suggestion.region
        ? `${suggestion.name}, ${suggestion.region}, ${suggestion.country}`
        : `${suggestion.name}, ${suggestion.country}`;
      setCityInput(label);
      setCitySuggestions([]);
      setShowSuggestions(false);
      weather.fetchWeather(suggestion.name);
    },
    [weather]
  );

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      try {
        await weather.fetchWeather(cityInput.trim());
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
    }
  };

  const handleGeolocation = async () => {
    try {
      await weather.fetchByGeolocation();
    } catch (error) {
      console.error("Geolocation error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>

        {!isPremium && (
          <Link href="/dashboard/upgrade">
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleCitySearch} className="flex gap-2 flex-1">
          <div className="relative flex-1" ref={suggestionsRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search city..."
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10"
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
                {citySuggestionsLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                ) : (
                  citySuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectCity(s);
                      }}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">
                        {s.region ? `${s.region}, ${s.country}` : s.country}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <Button type="submit" disabled={weather.loading}>
            {weather.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>
        <Button
          variant="outline"
          onClick={handleGeolocation}
          disabled={weather.loading}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Use My Location
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <WeatherCard
          data={weather.data?.current || null}
          forecast={weather.data?.forecast || null}
          loading={weather.loading}
          isPremium={isPremium}
        />
        {canSeeCurrency ? (
          <CurrencyCard
            rates={currency.rates}
            date={currency.date}
            loading={currency.loading}
            isPremium={isPremium}
            selectedDate={currencyDate}
            onDateChange={(d) => {
              setCurrencyDate(d);
              currency.fetchRates(d);
            }}
          />
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            <p>Currency rates and converter are available for premium subscribers.</p>
            <Link href="/dashboard/upgrade" className="text-primary underline mt-2 inline-block">
              Upgrade to Premium
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
