-- Digital Bloom Subscription System Database Schema
-- Execute these in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL, -- 'basic', 'premium', 'church'
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'incomplete'
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    billing_interval TEXT DEFAULT 'month', -- 'month', 'year'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Reminders Table
CREATE TABLE IF NOT EXISTS user_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL, -- 'birthday', 'anniversary', 'holiday', 'memorial', 'custom'
    recipient_name TEXT,
    recipient_email TEXT,
    recipient_phone TEXT,
    auto_send BOOLEAN DEFAULT false,
    message_template TEXT,
    days_before INTEGER DEFAULT 1, -- How many days before to send reminder
    last_sent TIMESTAMP WITH TIME ZONE,
    next_reminder TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active', -- 'active', 'sent', 'paused'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-Send Queue Table (for managing scheduled sends)
CREATE TABLE IF NOT EXISTS auto_send_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_id UUID REFERENCES user_reminders(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    send_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    message_content TEXT,
    bloom_type TEXT,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Church Partnerships Table
CREATE TABLE IF NOT EXISTS church_partnerships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    denomination TEXT,
    congregation_size TEXT, -- 'small', 'medium', 'large', 'xlarge'
    current_communication TEXT,
    interest_areas TEXT, -- JSON array of interests
    special_requests TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'active'
    stripe_subscription_id TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Church Members Table (for B2B church management)
CREATE TABLE IF NOT EXISTS church_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    church_partnership_id UUID REFERENCES church_partnerships(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birthday DATE,
    anniversary_date DATE,
    member_since DATE,
    status TEXT DEFAULT 'active', -- 'active', 'inactive'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Usage Tracking
CREATE TABLE IF NOT EXISTS subscription_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    usage_type TEXT NOT NULL, -- 'bloom_sent', 'reminder_created', 'auto_send_used'
    usage_date DATE DEFAULT CURRENT_DATE,
    count INTEGER DEFAULT 1,
    metadata JSONB, -- Store additional usage details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks Log Table (for Stripe webhooks)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT false,
    data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_reminders_user_id ON user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_date ON user_reminders(date);
CREATE INDEX IF NOT EXISTS idx_user_reminders_next_reminder ON user_reminders(next_reminder);

CREATE INDEX IF NOT EXISTS idx_auto_send_queue_send_date ON auto_send_queue(send_date);
CREATE INDEX IF NOT EXISTS idx_auto_send_queue_status ON auto_send_queue(status);

CREATE INDEX IF NOT EXISTS idx_church_partnerships_status ON church_partnerships(status);
CREATE INDEX IF NOT EXISTS idx_church_members_church_id ON church_members(church_partnership_id);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_date ON subscription_usage(user_id, usage_date);

-- Row Level Security (RLS) Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_send_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_reminders
CREATE POLICY "Users can manage own reminders" ON user_reminders
    FOR ALL USING (auth.uid() = user_id);

-- Policies for auto_send_queue
CREATE POLICY "Users can view own auto-send queue" ON auto_send_queue
    FOR SELECT USING (auth.uid() = user_id);

-- Policies for church_partnerships
CREATE POLICY "Users can manage own church partnerships" ON church_partnerships
    FOR ALL USING (auth.uid() = user_id);

-- Policies for church_members (church admins only)
CREATE POLICY "Church admins can manage members" ON church_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM church_partnerships 
            WHERE id = church_members.church_partnership_id 
            AND user_id = auth.uid()
        )
    );

-- Policies for subscription_usage
CREATE POLICY "Users can view own usage" ON subscription_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reminders_updated_at BEFORE UPDATE ON user_reminders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_partnerships_updated_at BEFORE UPDATE ON church_partnerships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_members_updated_at BEFORE UPDATE ON church_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate next reminder date
CREATE OR REPLACE FUNCTION calculate_next_reminder()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate next reminder based on date and days_before
    NEW.next_reminder = (NEW.date - INTERVAL '1 day' * NEW.days_before);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically set next_reminder
CREATE TRIGGER set_next_reminder BEFORE INSERT OR UPDATE ON user_reminders
    FOR EACH ROW EXECUTE FUNCTION calculate_next_reminder();

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits(user_uuid UUID, feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
    usage_count INTEGER;
BEGIN
    -- Get user's current plan
    SELECT plan_id INTO user_plan 
    FROM user_subscriptions 
    WHERE user_id = user_uuid AND status = 'active' 
    LIMIT 1;
    
    -- If no subscription, deny access
    IF user_plan IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check feature limits based on plan
    CASE 
        WHEN user_plan = 'basic' AND feature = 'reminders' THEN
            SELECT COUNT(*) INTO usage_count 
            FROM user_reminders 
            WHERE user_id = user_uuid AND status = 'active';
            RETURN usage_count < 50; -- Basic plan limit
            
        WHEN user_plan = 'basic' AND feature = 'auto_send' THEN
            SELECT COUNT(*) INTO usage_count 
            FROM user_reminders 
            WHERE user_id = user_uuid AND status = 'active' AND auto_send = true;
            RETURN usage_count < 10; -- Basic auto-send limit
            
        WHEN user_plan IN ('premium', 'church') THEN
            RETURN TRUE; -- No limits for premium/church
            
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;