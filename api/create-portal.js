// Vercel Edge Function for creating Stripe customer portal sessions
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    // Get user's Stripe customer ID
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (error || !subscription?.stripe_customer_id) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${req.headers.origin}/subscription`,
    });

    res.status(200).json({ 
      url: session.url 
    });

  } catch (error) {
    console.error('Portal session creation failed:', error);
    res.status(500).json({ error: error.message });
  }
}