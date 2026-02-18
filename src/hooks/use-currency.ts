"use client";

import { useState, useCallback } from 'react';
import { CurrencyRate } from '@/types';

interface CurrencyState {
  rates: CurrencyRate[];
  date: string | null;
  loading: boolean;
  error: string | null;
}

export function useCurrency() {
  const [state, setState] = useState<CurrencyState>({
    rates: [],
    date: null,
    loading: false,
    error: null,
  });

  const fetchRates = useCallback(async (date?: string | null) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      const response = await fetch(`/api/currency?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch currency rates');
      }

      setState({
        rates: data.rates,
        date: data.date,
        loading: false,
        error: null,
      });

      return data.rates;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch currency rates';
      setState(prev => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  }, []);

  const convert = useCallback((
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number | null => {
    const rates = state.rates;
    
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'BYN') {
      const targetRate = rates.find(r => r.Cur_Abbreviation === toCurrency);
      if (!targetRate) return null;
      return amount * targetRate.Cur_Scale / targetRate.Cur_OfficialRate;
    }
    
    if (toCurrency === 'BYN') {
      const sourceRate = rates.find(r => r.Cur_Abbreviation === fromCurrency);
      if (!sourceRate) return null;
      return amount * sourceRate.Cur_OfficialRate / sourceRate.Cur_Scale;
    }
    
    const sourceRate = rates.find(r => r.Cur_Abbreviation === fromCurrency);
    const targetRate = rates.find(r => r.Cur_Abbreviation === toCurrency);
    
    if (!sourceRate || !targetRate) return null;
    
    const bynAmount = amount * sourceRate.Cur_OfficialRate / sourceRate.Cur_Scale;
    return bynAmount * targetRate.Cur_Scale / targetRate.Cur_OfficialRate;
  }, [state.rates]);

  return {
    ...state,
    fetchRates,
    convert,
  };
}
