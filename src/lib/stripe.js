import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe (you'll need to set this in your environment)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Bloom',
    price: 9,
    interval: 'month',
    stripe_price_id: 'price_basic_monthly', // Replace with actual Stripe price ID
    features: [
      'Date reminders & auto-send',
      'Basic flower selection',
      'Birthday & anniversary tracking',
      'Email notifications',
      'Mobile app access'
    ],
    limits: {
      reminders: 50,
      auto_send: 10
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium Bloom',
    price: 19,
    interval: 'month',
    stripe_price_id: 'price_premium_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Basic',
      'All content access',
      'Advanced customization',
      'SMS notifications',
      'Priority support',
      'Custom message templates'
    ],
    limits: {
      reminders: -1, // Unlimited
      auto_send: -1  // Unlimited
    }
  },
  church: {
    id: 'church',
    name: 'Church Partnership',
    price: 49,
    interval: 'month',
    stripe_price_id: 'price_church_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Premium',
      'Bulk sending for congregations',
      'Admin dashboard',
      'Member management',
      'Custom branding',
      'Dedicated support'
    ],
    limits: {
      reminders: -1, // Unlimited
      auto_send: -1, // Unlimited
      church_members: -1 // Unlimited
    }
  }
};

export class StripeSubscriptionService {
  constructor() {
    this.stripe = null;
    this.initStripe();
  }

  async initStripe() {
    this.stripe = await stripePromise;
  }

  async createCheckoutSession(planId, userId) {
    try {
      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call your backend API to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          price_id: plan.stripe_price_id,
          plan_id: planId,
          user_id: user.id,
          user_email: user.email
        })
      });

      const session = await response.json();
      
      if (!response.ok) {
        throw new Error(session.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const { error } = await this.stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async createCustomerPortalSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      const session = await response.json();
      
      if (!response.ok) {
        throw new Error(session.error || 'Failed to create portal session');
      }

      // Redirect to customer portal
      window.location.href = session.url;

    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  async getCurrentSubscription() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          subscription_id: subscriptionId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }

      return result;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async checkSubscriptionLimits(feature) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('check_subscription_limits', {
          user_uuid: user.id,
          feature: feature
        });

      if (error) {
        console.error('Error checking limits:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error checking subscription limits:', error);
      return false;
    }
  }

  async trackUsage(usageType, metadata = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = await this.getCurrentSubscription();
      if (!subscription) return;

      const { error } = await supabase
        .from('subscription_usage')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          usage_type: usageType,
          metadata: metadata
        });

      if (error) {
        console.error('Error tracking usage:', error);
      }
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }
}

// Create singleton instance
export const stripeService = new StripeSubscriptionService();