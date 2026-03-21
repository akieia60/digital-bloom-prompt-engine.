# Digital Bloom Subscription System - Deployment Guide

## 🚀 David's $9/Month Recurring Revenue System

This guide will help you deploy the complete Digital Bloom subscription system with all of David's strategic vision implemented.

## Pre-Deployment Setup

### 1. Stripe Configuration

1. **Create Stripe Account** at https://stripe.com
2. **Create Products & Prices** in Stripe Dashboard:

   ```
   Basic Bloom - $9/month
   - Product Name: "Basic Bloom"
   - Price: $9.00 USD recurring monthly
   - Price ID: price_basic_monthly (save this)

   Premium Bloom - $19/month  
   - Product Name: "Premium Bloom"
   - Price: $19.00 USD recurring monthly
   - Price ID: price_premium_monthly (save this)

   Church Partnership - $49/month
   - Product Name: "Church Partnership"  
   - Price: $49.00 USD recurring monthly
   - Price ID: price_church_monthly (save this)
   ```

3. **Configure Webhook Endpoint**:
   - URL: `https://your-domain.vercel.app/api/stripe-webhook`
   - Events to send: 
     - `customer.subscription.created`
     - `customer.subscription.updated` 
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### 2. Supabase Database Setup

1. **Run Database Schema**:
   - Open Supabase SQL Editor
   - Copy and execute `database-schema.sql`
   - Verify all tables and policies are created

2. **Enable Row Level Security**:
   - All tables should have RLS enabled
   - Policies are created for user data isolation

### 3. Email Configuration

1. **Gmail App Password** (recommended):
   - Go to Google Account settings
   - Enable 2-factor authentication  
   - Generate App Password for "Digital Bloom"
   - Use this password in EMAIL_PASSWORD env var

2. **Alternative Email Services**:
   - SendGrid, Mailgun, or Amazon SES
   - Update transporter config in `process-reminders.js`

## Deployment Steps

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

**Critical Variables:**
- `STRIPE_SECRET_KEY`: From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET`: From webhook configuration
- `VITE_STRIPE_PUBLISHABLE_KEY`: From Stripe Dashboard
- `EMAIL_FROM` & `EMAIL_PASSWORD`: Email credentials
- `SUPABASE_SERVICE_ROLE_KEY`: From Supabase settings

### 2. Install Dependencies

```bash
npm install
npm install stripe nodemailer @stripe/stripe-js
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# ... (add all environment variables)

# Deploy production
vercel --prod
```

### 4. Update Stripe Webhook URL

After deployment, update your Stripe webhook URL to:
`https://your-production-url.vercel.app/api/stripe-webhook`

### 5. Test the System

1. **Test Subscription Flow**:
   - Create account in app
   - Try subscribing to each plan
   - Verify webhooks are received
   - Check Supabase for subscription records

2. **Test Reminders**:
   - Add a reminder for tomorrow
   - Manually trigger: `curl -X POST https://your-domain.vercel.app/api/process-reminders -H "Authorization: Bearer YOUR_CRON_SECRET"`
   - Verify email is received

## Post-Deployment Configuration

### 1. Stripe Price IDs

Update `src/lib/stripe.js` with your actual Stripe Price IDs:

```javascript
export const SUBSCRIPTION_PLANS = {
  basic: {
    stripe_price_id: 'price_1234567890', // Your actual Basic price ID
    // ...
  },
  premium: {
    stripe_price_id: 'price_0987654321', // Your actual Premium price ID 
    // ...
  },
  church: {
    stripe_price_id: 'price_1122334455', // Your actual Church price ID
    // ...
  }
};
```

### 2. Domain Configuration

Update these URLs throughout the codebase:
- `process-reminders.js`: Update app URL in email templates
- `create-checkout.js`: Update success/cancel URLs
- Email templates: Update Digital Bloom app links

### 3. Cron Job Verification

The cron job runs daily at 9 AM UTC. Monitor:
- Vercel Functions logs
- Email delivery
- Supabase subscription_usage table

## David's Business Features Status

✅ **$9/Month Basic Plan**: Date reminders + auto-send  
✅ **$19/Month Premium Plan**: All features + customization  
✅ **$49/Month Church B2B**: Bulk sending + admin tools  
✅ **Auto-Send System**: Scheduled Digital Bloom delivery  
✅ **Church Partnerships**: Application flow + member management  
✅ **Memorial/Spiritual**: "Dearly Departed" section ready  
✅ **Email Automation**: Beautiful HTML reminder emails  
✅ **Usage Tracking**: Subscription limits + analytics  
✅ **Multi-language Ready**: Database structure supports expansion  

## Revenue Tracking

Monitor these metrics in Supabase:
- `user_subscriptions`: Active subscriber counts by plan
- `subscription_usage`: Feature usage per user
- `church_partnerships`: B2B pipeline
- `auto_send_queue`: Automation engagement

## Support & Troubleshooting

### Common Issues:

1. **Stripe webhook failures**: Check webhook secret matches
2. **Email not sending**: Verify Gmail app password
3. **Database errors**: Check RLS policies are correct
4. **Subscription limits not working**: Verify `check_subscription_limits` function

### Monitoring:

- Vercel Function logs for errors
- Stripe Dashboard for payment issues  
- Supabase logs for database issues
- Email service delivery reports

## Scaling Considerations

- **Email Volume**: Consider SendGrid/Mailgun for >1000 users
- **Database**: Monitor Supabase usage limits
- **Stripe**: No limits on standard plan
- **Vercel Functions**: Monitor execution time/memory usage

---

**🎉 David's Vision is Live!**

The complete $9/month subscription business model with church partnerships, auto-send functionality, and memorial services is now ready to generate recurring revenue!