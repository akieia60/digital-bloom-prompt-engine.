// Vercel Edge Function for Stripe Webhooks
// Deploy this to handle Stripe subscription events

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const body = JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Log the webhook event
  await logWebhookEvent(event);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed
    await markWebhookProcessed(event.id);
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    await logWebhookError(event.id, error.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function logWebhookEvent(event) {
  try {
    await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        data: event.data,
        processed: false
      });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

async function markWebhookProcessed(eventId) {
  try {
    await supabase
      .from('webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('stripe_event_id', eventId);
  } catch (error) {
    console.error('Failed to mark webhook as processed:', error);
  }
}

async function logWebhookError(eventId, errorMessage) {
  try {
    await supabase
      .from('webhook_events')
      .update({
        error_message: errorMessage
      })
      .eq('stripe_event_id', eventId);
  } catch (error) {
    console.error('Failed to log webhook error:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  const { customer, id, status, current_period_start, current_period_end, items } = subscription;
  
  // Get the customer details to find the user
  const customer_details = await stripe.customers.retrieve(customer);
  const user_email = customer_details.email;

  // Get user ID from auth.users
  const { data: user } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', user_email)
    .single();

  if (!user) {
    throw new Error(`User not found for email: ${user_email}`);
  }

  // Determine plan ID from price
  const price_id = items.data[0].price.id;
  const plan_id = getPlanIdFromPriceId(price_id);

  // Insert subscription record
  await supabase
    .from('user_subscriptions')
    .insert({
      user_id: user.id,
      stripe_subscription_id: id,
      stripe_customer_id: customer,
      plan_id: plan_id,
      status: status,
      price: items.data[0].price.unit_amount / 100,
      current_period_start: new Date(current_period_start * 1000).toISOString(),
      current_period_end: new Date(current_period_end * 1000).toISOString()
    });

  console.log(`Subscription created for user ${user.id}, plan: ${plan_id}`);
}

async function handleSubscriptionUpdated(subscription) {
  const { id, status, current_period_start, current_period_end, cancel_at_period_end } = subscription;

  await supabase
    .from('user_subscriptions')
    .update({
      status: status,
      current_period_start: new Date(current_period_start * 1000).toISOString(),
      current_period_end: new Date(current_period_end * 1000).toISOString(),
      cancel_at_period_end: cancel_at_period_end
    })
    .eq('stripe_subscription_id', id);

  console.log(`Subscription updated: ${id}, status: ${status}`);
}

async function handleSubscriptionDeleted(subscription) {
  const { id } = subscription;

  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled'
    })
    .eq('stripe_subscription_id', id);

  console.log(`Subscription canceled: ${id}`);
}

async function handlePaymentSucceeded(invoice) {
  const { subscription, customer } = invoice;
  
  // Update subscription status to active
  if (subscription) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'active'
      })
      .eq('stripe_subscription_id', subscription);
  }

  console.log(`Payment succeeded for subscription: ${subscription}`);
}

async function handlePaymentFailed(invoice) {
  const { subscription } = invoice;
  
  // Update subscription status
  if (subscription) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'past_due'
      })
      .eq('stripe_subscription_id', subscription);
  }

  console.log(`Payment failed for subscription: ${subscription}`);
}

function getPlanIdFromPriceId(priceId) {
  const PRICE_TO_PLAN_MAP = {
    'price_basic_monthly': 'basic',
    'price_premium_monthly': 'premium',
    'price_church_monthly': 'church',
    // Add your actual Stripe price IDs here
  };

  return PRICE_TO_PLAN_MAP[priceId] || 'basic';
}