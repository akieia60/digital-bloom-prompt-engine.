import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Bell, Heart, Church, Star, Crown } from 'lucide-react';

const SUBSCRIPTION_TIERS = [
  {
    id: 'basic',
    name: 'Basic Bloom',
    price: 9,
    interval: 'month',
    features: [
      'Date reminders & auto-send',
      'Basic flower selection',
      'Birthday & anniversary tracking',
      'Email notifications',
      'Mobile app access'
    ],
    icon: <Bell className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-400',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium Bloom',
    price: 19,
    interval: 'month',
    features: [
      'Everything in Basic',
      'All content access',
      'Advanced customization',
      'SMS notifications',
      'Priority support',
      'Custom message templates'
    ],
    icon: <Star className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-400',
    popular: true
  },
  {
    id: 'church',
    name: 'Church Partnership',
    price: 49,
    interval: 'month',
    features: [
      'Everything in Premium',
      'Bulk sending for congregations',
      'Admin dashboard',
      'Member management',
      'Custom branding',
      'Dedicated support'
    ],
    icon: <Church className="w-6 h-6" />,
    gradient: 'from-amber-500 to-orange-400',
    popular: false
  }
];

export default function SubscriptionDashboard() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    getCurrentUser();
    getCurrentSubscription();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const getCurrentSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      } else if (data) {
        setCurrentPlan(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier) => {
    if (!user) {
      // Redirect to sign up/login
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });
      if (error) console.error('Auth error:', error);
      return;
    }

    // This would integrate with Stripe
    console.log('Starting subscription for:', tier.id);
    // TODO: Implement Stripe checkout
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
          Subscription Plans
        </h2>
        <p className="text-gray-600 font-medium mt-2">
          Choose your Digital Bloom experience
        </p>
      </div>

      {currentPlan && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-green-800">Current Plan</h3>
              <p className="text-green-600">
                {SUBSCRIPTION_TIERS.find(t => t.id === currentPlan.plan_id)?.name} - ${currentPlan.price}/month
              </p>
              <p className="text-sm text-green-500 mt-1">
                Next billing: {new Date(currentPlan.current_period_end).toLocaleDateString()}
              </p>
            </div>
            <Crown className="w-8 h-8 text-green-600" />
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {SUBSCRIPTION_TIERS.map((tier) => (
          <div 
            key={tier.id}
            className={`relative glass rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl ${
              tier.popular 
                ? 'border-amber-300 shadow-lg ring-2 ring-amber-200' 
                : 'border-white/40 hover:border-amber-200'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </span>
              </div>
            )}

            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r ${tier.gradient} text-white mb-4`}>
              {tier.icon}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
              <span className="text-gray-600">/{tier.interval}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${tier.gradient} flex-shrink-0 mt-0.5`}>
                    <svg className="w-3 h-3 text-white m-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(tier)}
              className={`w-full py-3 px-6 rounded-2xl font-bold text-white transition-all transform active:scale-95 ${
                currentPlan?.plan_id === tier.id
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `bg-gradient-to-r ${tier.gradient} hover:shadow-lg`
              }`}
              disabled={currentPlan?.plan_id === tier.id}
            >
              {currentPlan?.plan_id === tier.id ? 'Current Plan' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      {/* Dearly Departed Section */}
      <div className="mt-12 p-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl border border-gray-200">
        <div className="text-center mb-6">
          <Heart className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Dearly Departed</h3>
          <p className="text-gray-600">
            Honor loved ones with beautiful memorial messages and spiritual content
          </p>
        </div>
        <div className="text-center">
          <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg transition-all">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}