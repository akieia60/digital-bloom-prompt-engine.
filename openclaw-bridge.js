import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ljzlkphwkgyavqmoremg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const OPENCLAW_URL = 'http://127.0.0.1:18789';
const OPENCLAW_TOKEN = 'digitalbloom2026';

console.log('🌸 Starting OpenClaw Bridge Daemon...');
console.log(`📡 Connecting to Supabase project: ljzlkphwkgyavqmoremg`);

// Subscribe to new user messages
supabase
  .channel('monique_chat_bridge')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'monique_chat',
      filter: 'role=eq.user',
    },
    async (payload) => {
      const message = payload.new;
      console.log(`\n💬 Received user message: "${message.content}"`);

      try {
        // Mark as processing
        await supabase
          .from('monique_chat')
          .update({ status: 'processing' })
          .eq('id', message.id);

        console.log(`🤖 Forwarding to OpenClaw Gateway (${OPENCLAW_URL})...`);
        
        // Pass message to local OpenClaw Gateway using standard chat completion format
        const response = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENCLAW_TOKEN}`
          },
          body: JSON.stringify({
            model: "openai-codex/gpt-4o",
            messages: [{ role: "user", content: message.content }]
          })
        });

        if (!response.ok) {
          throw new Error(`OpenClaw returned ${response.status}`);
        }

        const data = await response.json();
        const replyContent = data.choices?.[0]?.message?.content || 'I completed that request through OpenClaw.';
        
        console.log(`✅ OpenClaw Response: "${replyContent.substring(0, 50)}..."`);

        // Write OpenClaw's reply back to Supabase
        await supabase
          .from('monique_chat')
          .insert({
            role: 'monique',
            content: replyContent,
            status: 'completed'
          });

        // Mark local as completed
        await supabase
          .from('monique_chat')
          .update({ status: 'completed' })
          .eq('id', message.id);

      } catch (err) {
        console.error(`❌ Error communicating with OpenClaw:`, err.message);
        
        await supabase
          .from('monique_chat')
          .update({ status: 'failed' })
          .eq('id', message.id);
          
        await supabase
          .from('monique_chat')
          .insert({
            role: 'monique',
            content: `My logical brain (OpenClaw) hit a snag on the local machine: ${err.message}`,
            status: 'failed'
          });
      }
    }
  )
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('🟢 Bridge is fully connected and listening for PWA chat messages!');
    } else {
      console.log(`⚠️ Bridge connection status changed: ${status}`);
    }
  });

// Keep process alive
setInterval(() => {}, 1000 * 60 * 60);
