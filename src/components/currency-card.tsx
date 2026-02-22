"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CurrencyRate } from "@/types";
import { ArrowRightLeft } from "lucide-react";

interface CurrencyCardProps {
  rates: CurrencyRate[];
  date: string | null;
  loading: boolean;
  isPremium: boolean;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

export function CurrencyCard({
  rates,
  date,
  loading,
  isPremium,
  selectedDate,
  onDateChange,
}: CurrencyCardProps) {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("BYN");
  const [toCurrency, setToCurrency] = useState("USD");
  const [result, setResult] = useState<number | null>(null);

  const convert = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      setResult(null);
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult(amountNum);
      return;
    }

    const sourceRate = rates.find((r) => r.Cur_Abbreviation === fromCurrency);
    const targetRate = rates.find((r) => r.Cur_Abbreviation === toCurrency);

    if (fromCurrency === "BYN") {
      if (!targetRate) return;
      setResult(amountNum * targetRate.Cur_Scale / targetRate.Cur_OfficialRate);
      return;
    }

    if (toCurrency === "BYN") {
      if (!sourceRate) return;
      setResult(amountNum * sourceRate.Cur_OfficialRate / sourceRate.Cur_Scale);
      return;
    }

    if (!sourceRate || !targetRate) return;

    const bynAmount = amountNum * sourceRate.Cur_OfficialRate / sourceRate.Cur_Scale;
    setResult(bynAmount * targetRate.Cur_Scale / targetRate.Cur_OfficialRate);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Курсы валют НБРБ</CardTitle>
              <CardDescription>
                Официальные курсы Национального банка Республики Беларусь
                {date && ` (${new Date(date).toLocaleDateString('ru-RU')})`}
              </CardDescription>
            </div>
            {onDateChange && selectedDate ? (
              <div className="flex items-center gap-2">
                <Label htmlFor="currency-date" className="text-muted-foreground text-xs whitespace-nowrap">
                  Дата
                </Label>
                <Input
                  id="currency-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-[140px]"
                />
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Валюта</TableHead>
                <TableHead>Код</TableHead>
                <TableHead className="text-right">Курс (BYN)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.Cur_ID}>
                  <TableCell>
                    {rate.Cur_Scale} {rate.Cur_Name}
                  </TableCell>
                  <TableCell>{rate.Cur_Abbreviation}</TableCell>
                  <TableCell className="text-right font-medium">
                    {rate.Cur_OfficialRate.toFixed(4)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Конвертер валют
            {!isPremium && (
              <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                Базовый
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Конвертация между BYN и основными валютами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
              <div className="space-y-2">
                <Label>Сумма</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setResult(null);
                  }}
                  placeholder="Введите сумму"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={swapCurrencies}
                className="mb-0.5"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
              <div className="space-y-2">
                <Label>Результат</Label>
                <Input
                  value={
                    result !== null ? result.toFixed(4) : ""
                  }
                  readOnly
                  placeholder="Нажмите «Конвертировать»"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Из</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BYN">BYN (Белорусский рубль)</SelectItem>
                    {rates.map((rate) => (
                      <SelectItem
                        key={rate.Cur_ID}
                        value={rate.Cur_Abbreviation}
                      >
                        {rate.Cur_Abbreviation} ({rate.Cur_Name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>В</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BYN">BYN (Белорусский рубль)</SelectItem>
                    {rates.map((rate) => (
                      <SelectItem
                        key={rate.Cur_ID}
                        value={rate.Cur_Abbreviation}
                      >
                        {rate.Cur_Abbreviation} ({rate.Cur_Name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={convert} className="w-full">
              Конвертировать
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
