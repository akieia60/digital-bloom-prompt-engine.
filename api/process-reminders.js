// Vercel Cron Job / Edge Function for processing date reminders
// Set up as a cron job to run daily at 9 AM

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Email configuration (using Gmail SMTP as example)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD // App-specific password
  }
});

export default async function handler(req, res) {
  // Verify this is a cron job request (optional security)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting reminder processing...');
    
    // Get all reminders that should be sent today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: reminders, error: remindersError } = await supabase
      .from('user_reminders')
      .select(`
        *,
        user_subscriptions!inner(status, plan_id)
      `)
      .lte('next_reminder', new Date().toISOString())
      .eq('status', 'active')
      .eq('user_subscriptions.status', 'active'); // Only active subscribers

    if (remindersError) {
      throw new Error(`Failed to fetch reminders: ${remindersError.message}`);
    }

    console.log(`Found ${reminders?.length || 0} reminders to process`);

    let processedCount = 0;
    let errorCount = 0;

    for (const reminder of reminders || []) {
      try {
        await processReminder(reminder);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process reminder ${reminder.id}:`, error);
        errorCount++;
      }
    }

    // Clean up old auto-send queue items (older than 30 days)
    await supabase
      .from('auto_send_queue')
      .delete()
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const result = {
      processed: processedCount,
      errors: errorCount,
      total: reminders?.length || 0,
      timestamp: new Date().toISOString()
    };

    console.log('Reminder processing completed:', result);
    res.status(200).json(result);

  } catch (error) {
    console.error('Reminder processing failed:', error);
    res.status(500).json({ error: error.message });
  }
}

async function processReminder(reminder) {
  const {
    id,
    user_id,
    title,
    date,
    type,
    recipient_name,
    recipient_email,
    auto_send,
    message_template,
    days_before
  } = reminder;

  // Calculate if this is the actual event day
  const eventDate = new Date(date);
  const today = new Date();
  const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  
  // Send reminder notification to user
  await sendReminderNotification(reminder, daysUntilEvent);

  // If auto-send is enabled and it's time to send
  if (auto_send && recipient_email && daysUntilEvent <= 0) {
    await queueAutoSend(reminder);
  }

  // Update the reminder's next send date (for recurring reminders)
  await updateNextReminderDate(reminder);

  // Track usage
  await supabase
    .from('subscription_usage')
    .insert({
      user_id: user_id,
      usage_type: 'reminder_processed',
      metadata: {
        reminder_id: id,
        type: type,
        auto_send: auto_send
      }
    });
}

async function sendReminderNotification(reminder, daysUntilEvent) {
  const { user_id, title, date, recipient_name } = reminder;

  // Get user's email from auth.users (you might need to adjust this based on your schema)
  const { data: userProfile } = await supabase.auth.admin.getUserById(user_id);
  const userEmail = userProfile?.user?.email;

  if (!userEmail) {
    console.log(`No email found for user ${user_id}`);
    return;
  }

  let subject, message;
  
  if (daysUntilEvent === 0) {
    subject = `🌸 Today: ${title}`;
    message = `Today is the special day for ${title}!\n\n`;
  } else if (daysUntilEvent > 0) {
    subject = `🌸 Reminder: ${title} in ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''}`;
    message = `Don't forget: ${title} is coming up in ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''} (${new Date(date).toLocaleDateString()}).\n\n`;
  } else {
    // Past date
    return;
  }

  if (recipient_name) {
    message += `For: ${recipient_name}\n`;
  }

  message += `\nEvent Date: ${new Date(date).toLocaleDateString()}\n\n`;
  message += `Create a beautiful Digital Bloom at: ${process.env.VERCEL_URL || 'https://digitalbloom.app'}\n\n`;
  message += `💐 Digital Bloom - Never forget the special moments`;

  try {
    await transporter.sendMail({
      from: `"Digital Bloom Reminders" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: subject,
      text: message,
      html: createReminderEmailHTML(reminder, daysUntilEvent)
    });

    console.log(`Reminder notification sent to ${userEmail} for ${title}`);
  } catch (error) {
    console.error(`Failed to send reminder email to ${userEmail}:`, error);
  }
}

async function queueAutoSend(reminder) {
  const { id, user_id, recipient_email, recipient_name, title, type } = reminder;

  // Check if already queued for today
  const today = new Date().toISOString().split('T')[0];
  const { data: existingQueue } = await supabase
    .from('auto_send_queue')
    .select('id')
    .eq('reminder_id', id)
    .gte('send_date', today)
    .single();

  if (existingQueue) {
    console.log(`Auto-send already queued for reminder ${id}`);
    return;
  }

  // Queue the auto-send
  await supabase
    .from('auto_send_queue')
    .insert({
      user_id: user_id,
      reminder_id: id,
      recipient_email: recipient_email,
      recipient_name: recipient_name,
      send_date: new Date().toISOString(),
      status: 'pending',
      message_content: `A special Digital Bloom for ${title}`,
      bloom_type: type
    });

  console.log(`Auto-send queued for reminder ${id} to ${recipient_email}`);
}

async function updateNextReminderDate(reminder) {
  const { id, date, days_before } = reminder;
  
  // For now, we'll set next reminder to next year for birthdays/anniversaries
  // You can make this more sophisticated based on reminder type
  let nextYear = new Date(date);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  
  const nextReminder = new Date(nextYear);
  nextReminder.setDate(nextReminder.getDate() - days_before);

  await supabase
    .from('user_reminders')
    .update({
      next_reminder: nextReminder.toISOString(),
      last_sent: new Date().toISOString()
    })
    .eq('id', id);
}

function createReminderEmailHTML(reminder, daysUntilEvent) {
  const { title, date, recipient_name, type } = reminder;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Digital Bloom Reminder</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌸 Digital Bloom Reminder</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-top: 0;">
                ${daysUntilEvent === 0 ? '🎉 Today:' : `⏰ ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''} to go:`}
            </h2>
            <h3 style="color: #f59e0b; font-size: 24px; margin: 10px 0;">${title}</h3>
            <p style="font-size: 16px; margin: 15px 0;">
                <strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
            </p>
            ${recipient_name ? `<p style="font-size: 16px;"><strong>For:</strong> ${recipient_name}</p>` : ''}
            <p style="font-size: 16px;"><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.VERCEL_URL || 'https://digitalbloom.app'}" 
               style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); color: white; text-decoration: none; padding: 15px 30px; border-radius: 30px; font-weight: bold; font-size: 16px;">
                Create Digital Bloom 🌸
            </a>
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>💐 <strong>Digital Bloom</strong> - Never forget the special moments</p>
            <p>Beautiful digital flowers for every occasion</p>
        </div>
    </body>
    </html>
  `;
}