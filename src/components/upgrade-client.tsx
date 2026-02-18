"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PLAN_TEMPLATES = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$9.99",
    period: "/month",
    features: [
      "7-day extended forecast",
      "Save multiple cities",
      "Priority support",
      "Ad-free experience",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "$99.99",
    period: "/year",
    features: [
      "Everything in Monthly",
      "2 months free",
      "Early access to new features",
      "Exclusive premium support",
    ],
    popular: true,
  },
] as const;

export default function UpgradeClient() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [priceIds, setPriceIds] = useState<{ monthly: string; yearly: string }>({
    monthly: "",
    yearly: "",
  });
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stripe/prices");
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setPriceIds({
            monthly: data.monthlyPriceId ?? "",
            yearly: data.yearlyPriceId ?? "",
          });
        }
      } catch {
        if (!cancelled) setPriceIds((prev) => prev);
      } finally {
        if (!cancelled) setPricesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const plans = PLAN_TEMPLATES.map((t) => ({
    ...t,
    priceId: t.id === "monthly" ? priceIds.monthly : priceIds.yearly,
  }));
  const stripeConfigured = plans.some((p) => p.priceId?.trim());

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!priceId?.trim()) {
      toast({
        title: "Stripe не настроен",
        description:
          'Создайте в Stripe два Price с lookup_key "monthly" и "yearly" (Products → Add price → Recurring). См. инструкцию ниже.',
        variant: "destructive",
      });
      return;
    }
    setLoading(planId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session");
      if (data.url) window.location.href = data.url;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось открыть оплату",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {!stripeConfigured && !pricesLoading && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-500">
              Настройте цены в Stripe
            </CardTitle>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Цены подставляются по <strong>lookup_key</strong>. Не нужны переменные окружения с
                Price ID.
              </p>
              <ol className="list-decimal list-inside text-sm space-y-1 mt-2">
                <li>
                  Откройте{" "}
                  <a
                    href="https://dashboard.stripe.com/products"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Stripe → Products
                  </a>
                </li>
                <li>
                  Создайте продукт (например, &quot;Premium&quot;) и добавьте два Price: месячный и
                  годовой (Recurring).
                </li>
                <li>
                  В каждом Price укажите <strong>Lookup key</strong>: <code>monthly</code> и{" "}
                  <code>yearly</code>.
                </li>
                <li>
                  <a
                    href="https://docs.stripe.com/prices/overview#lookup-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Документация: Lookup keys
                  </a>
                </li>
              </ol>
            </div>
          </CardHeader>
        </Card>
      )}

      {pricesLoading ? (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto py-8">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto py-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.popular ? "border-yellow-500 relative" : ""}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Best Value
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  disabled={loading !== null || !plan.priceId}
                  className={
                    plan.popular
                      ? "w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      : "w-full"
                  }
                >
                  {loading === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Crown className="h-4 w-4 mr-2" />
                  )}
                  Subscribe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
