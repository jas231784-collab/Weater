import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';
import type { Database } from '@/types/database';
import Stripe from 'stripe';

type UserRow = Database['public']['Tables']['users']['Row'];

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Admin client failed';
    console.error('Stripe webhook:', msg);
    return NextResponse.json(
      { error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY required for webhooks' },
      { status: 503 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        let userId = session.metadata?.userId as string | undefined;
        const customerId = session.customer as string;
        const rawSub = session.subscription;
        const subscriptionId =
          typeof rawSub === 'string' ? rawSub : (rawSub as Stripe.Subscription | null)?.id ?? null;

        if (!userId && customerId) {
          const { data } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();
          const byCustomer = data as { id: string } | null;
          userId = byCustomer?.id ?? undefined;
        }

        if (userId && subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
            expand: ['items.data'],
          });
          const item = subscription.items.data[0];
          const periodStart = item?.current_period_start ?? subscription.billing_cycle_anchor;
          const periodEnd = item?.current_period_end ?? subscription.billing_cycle_anchor;

          const { error } = await supabase
            .from('users')
            // @ts-ignore - Supabase update type inference
            .update({
              subscription_status: 'premium',
              subscription_start: new Date(periodStart * 1000).toISOString(),
              subscription_end: new Date(periodEnd * 1000).toISOString(),
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: customerId,
            })
            .eq('id', userId);
          if (error) {
            console.error('Webhook checkout.session.completed update error:', error);
          }
        } else {
          console.warn('checkout.session.completed: missing userId or subscriptionId', {
            userId,
            subscriptionId,
            customerId,
            hasMetadata: !!session.metadata,
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const rawSub = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription;
        const subscriptionId =
          typeof rawSub === 'string' ? rawSub : (rawSub as Stripe.Subscription | null)?.id ?? null;

        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .single();
        const user = data as UserRow | null;

        if (user && subscriptionId) {
          const subId = subscriptionId;
          const subscription = await getStripe().subscriptions.retrieve(subId, {
            expand: ['items.data'],
          });
          const item = subscription.items.data[0];
          const periodStart = item?.current_period_start ?? subscription.billing_cycle_anchor;
          const periodEnd = item?.current_period_end ?? subscription.billing_cycle_anchor;
          
          const { error } = await supabase
            .from('users')
            // @ts-ignore - Supabase update type inference
            .update({
              subscription_status: 'premium',
              subscription_start: new Date(periodStart * 1000).toISOString(),
              subscription_end: new Date(periodEnd * 1000).toISOString(),
            })
            .eq('id', user.id);
          if (error) console.error('Webhook invoice.paid update error:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .single();
        const user = data as UserRow | null;

        if (user) {
          const { error } = await supabase
            .from('users')
            // @ts-ignore - Supabase update type inference
            .update({
              subscription_status: 'free',
              subscription_end: new Date().toISOString(),
              stripe_subscription_id: null,
            })
            .eq('id', user.id);
          if (error) console.error('Webhook customer.subscription.deleted update error:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    const message = error instanceof Error ? error.message : 'Webhook handler failed';
    const isConfigError = message.includes('STRIPE_SECRET_KEY') || message.includes('not set');
    return NextResponse.json(
      { error: message },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
