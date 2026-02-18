import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

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
    });
  } catch (error) {
    console.error('Stripe prices fetch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch prices';
    return NextResponse.json(
      { error: message, monthlyPriceId: null, yearlyPriceId: null },
      { status: 500 }
    );
  }
}
