import { NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

/**
 * Returns subscription Price IDs from Stripe by lookup_key.
 * @see https://docs.stripe.com/api/prices/list#list_prices-lookup_keys
 *
 * In Stripe Dashboard: create two recurring Prices and set:
 * - lookup_key = "monthly" for monthly plan
 * - lookup_key = "yearly" for yearly plan
 * Then no env vars for price IDs are needed.
 */
export async function GET() {
  const empty = { monthlyPriceId: null, yearlyPriceId: null, error: null as string | null };
  if (!isStripeConfigured()) {
    return NextResponse.json({
      ...empty,
      error: 'STRIPE_SECRET_KEY не задан. Добавьте ключ в Vercel → Environment Variables.',
    });
  }
  try {
    const stripe = getStripe();
    const { data: prices } = await stripe.prices.list({
      active: true,
      lookup_keys: ['monthly', 'yearly'],
    });

    const monthly = prices.find((p) => p.lookup_key === 'monthly');
    const yearly = prices.find((p) => p.lookup_key === 'yearly');

    return NextResponse.json({
      monthlyPriceId: monthly?.id ?? null,
      yearlyPriceId: yearly?.id ?? null,
      error: null,
    });
  } catch (error) {
    console.error('Stripe prices fetch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch prices';
    return NextResponse.json(
      { ...empty, error: message },
      { status: 200 }
    );
  }
}
