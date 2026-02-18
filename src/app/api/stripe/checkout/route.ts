import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';
import type { Database } from '@/types/database';

type UserRow = Database['public']['Tables']['users']['Row'];

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email.toLowerCase())
      .single();
    const user = data as UserRow | null;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      try {
        const admin = createAdminClient();
        const { error } = await admin
          .from('users')
          // @ts-ignore - Supabase update type inference
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);
        if (error) console.error('Checkout: failed to save stripe_customer_id', error);
      } catch (e) {
        console.error('Checkout: admin client (stripe_customer_id save)', e);
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    const isConfigError = message.includes('STRIPE_SECRET_KEY') || message.includes('not set');
    return NextResponse.json(
      { error: message },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
