import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yhdbeblowolfinxxhsnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZGJlYmxvd29sZmluenhobm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mjg0NDEsImV4cCI6MjA1ODQwNDQ0MX0.UvHcnN_eC7gvkHzEjM5zZl6xsUXKd8c3G4dKjWQe9PE';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🌱 Testing Supabase connection and seeding top videos...");

const topVideos = [
  { title: 'Pink Rose Gesture - I Love You', text: 'Romantic 30-second pink roses transformation sequence perfect for expressing love and affection.', category: 'I Love You' },
  { title: 'Basketball Celebration - Unique Sports', text: '45-second unique basketball-themed celebration perfect for sports achievements.', category: 'Celebration' },
  { title: 'Luxury Black Gold Card', text: '15-second premium black and gold card animation with luxury aesthetics.', category: 'Luxury' },
  { title: 'Premium Gift Box Showcase', text: '8-second elegant gift box presentation in 4K quality for product showcases.', category: 'Gift' },
  { title: 'Romantic Pink Bouquet', text: '10-second pink bouquet animation perfect for Valentine\'s Day and romantic occasions.', category: 'Valentine' },
  { title: 'Elegant Single Flower', text: '20-second minimalist single flower bloom for birthdays and appreciation.', category: 'Birthday' }
];

async function quickSeed() {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .insert(topVideos);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('✅ SUCCESS: Added 6 video entries to prompts table');
      console.log('Videos are now available in the Digital Bloom PWA!');
    }
  } catch (err) {
    console.error('Connection error:', err);
  }
}

quickSeed();