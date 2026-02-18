/**
 * Stripe API client — server-side only.
 * @see https://docs.stripe.com/keys
 *
 * Key types (Dashboard: https://dashboard.stripe.com/test/apikeys):
 * - Secret key (sk_test_... or sk_live_...): server-only, never expose. Used here.
 * - Publishable key (pk_test_... or pk_live_...): client-side only (e.g. Stripe.js).
 *
 * Sandbox (test) vs Live: use test keys for development; switch to live keys for production.
 */

import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
const isPlaceholder =
  !secretKey ||
  secretKey === 'sk_test_placeholder' ||
  secretKey === 'sk_live_placeholder';

function getStripeInstance(): Stripe {
  if (isPlaceholder) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set or is a placeholder. Get your key from Dashboard → API keys: https://dashboard.stripe.com/test/apikeys'
    );
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  });
}

/** Get Stripe server client. Throws if STRIPE_SECRET_KEY is missing. Use only on server. */
export function getStripe(): Stripe {
  return getStripeInstance();
}

/** Returns true if Stripe is configured (secret key set and not placeholder). */
export function isStripeConfigured(): boolean {
  return !isPlaceholder;
}
