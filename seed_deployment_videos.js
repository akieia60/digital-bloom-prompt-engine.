import { createClient } from '@supabase/supabase-js';

// Use the new Supabase project credentials
const supabaseUrl = 'https://yhdbeblowolfinxxhsnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZGJlYmxvd29sZmluenhobm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mjg0NDEsImV4cCI6MjA1ODQwNDQ0MX0.UvHcnN_eC7gvkHzEjM5zZl6xsUXKd8c3G4dKjWQe9PE';
const supabase = createClient(supabaseUrl, supabaseKey);

const DEPLOYMENT_VIDEO_ASSETS = [
  {
    id: "gesture_pink_roses_v1",
    title: "Pink Rose Gesture",
    category: "I Love You",
    videoPath: "/videos/ILoveYou_PinkRoses_Gesture_v1_Mar2026.mp4",
    thumbnailPath: "/thumbnails/ILoveYou_PinkRoses_Gesture_v1_Mar2026_thumb.jpg",
    prompt: "30-second romantic gesture sequence featuring pink balloons transforming into pink roses. Magical transformation with soft romantic lighting and gentle floating particles. Perfect for expressing love and affection.",
    occasion: "Valentine, I Love You, Romance",
    flower: "Pink Roses",
    style: "Gesture, Romantic",
    duration: 30,
    quality: "HD",
    status: "Ready"
  },
  {
    id: "basketball_celebration_v1",
    title: "Basketball Love Celebration",
    category: "Celebration",
    videoPath: "/videos/Celebration_Basketball_Unique_v1_Mar2026.mp4",
    thumbnailPath: "/thumbnails/Celebration_Basketball_Unique_v1_Mar2026_thumb.jpg",
    prompt: "45-second unique basketball-themed celebration sequence. Sports meets romance with dynamic energy and celebration vibes. Perfect for athletic achievements, sports fans, or unique celebration moments.",
    occasion: "Celebration, Sports, Achievement",
    flower: "Basketball Theme",
    style: "Unique, Dynamic",
    duration: 45,
    quality: "HD",
    status: "Ready"
  },
  {
    id: "luxury_black_gold_v1",
    title: "Luxury Black & Gold Card",
    category: "Luxury",
    videoPath: "/videos/Luxury_BlackGold_Card_v1_Mar2026.mp4",
    thumbnailPath: "/thumbnails/Luxury_BlackGold_Card_v1_Mar2026_thumb.jpg",
    prompt: "Premium black and gold card animation with luxury aesthetics. Elegant transitions and sophisticated styling perfect for high-end occasions and luxury messaging.",
    occasion: "Luxury, Premium, Business",
    flower: "Luxury Design",
    style: "Elegant, Premium",
    duration: 15,
    quality: "HD",
    status: "Ready"
  },
  {
    id: "gift_luxury_box_v1",
    title: "Premium Gift Box",
    category: "Gift",
    videoPath: "/videos/Gift_LuxuryBox_Premium_v1_Mar2026.mp4",
    thumbnailPath: "/thumbnails/Gift_LuxuryBox_Premium_v1_Mar2026_thumb.jpg",
    prompt: "Elegant gift box presentation in 4K grey luxury styling. Perfect for product packaging showcase or premium gift reveals. Sophisticated and clean design.",
    occasion: "Gift, Product, Showcase",
    flower: "Luxury Packaging",
    style: "Premium, Clean",
    duration: 8,
    quality: "4K",
    status: "Ready"
  },
  {
    id: "valentine_pink_bouquet_v1",
    title: "Romantic Pink Bouquet",
    category: "Valentine",
    videoPath: "/videos/Valentine_PinkBouquet_Romantic_v1_Mar2026.mp4",
    thumbnailPath: "/thumbnails/Valentine_PinkBouquet_Romantic_v1_Mar2026_thumb.jpg",
    prompt: "Beautiful pink bouquet photo animation with romantic styling. Soft, dreamy aesthetic perfect for Valentine's Day, anniversaries, or romantic occasions.",
    occasion: "Valentine, Anniversary, Romance",
    flower: "Pink Bouquet",
    style: "Romantic, Dreamy",
    duration: 10,
    quality: "HD",
    status: "Ready"
  },
  {
    id: "birthday_single_flower_v1",
    title: "Elegant Single Flower",
    category: "Birthday",
    videoPath: "/videos/Birthday_SingleFlower_Elegant_v1_Mar2026.mp4",
    thumbnailPath: "/thumbnails/Birthday_SingleFlower_Elegant_v1_Mar2026_thumb.jpg",
    prompt: "Single flower expanded to full screen with elegant presentation. Clean, minimalist aesthetic perfect for birthday wishes, appreciation, or simple elegant messaging.",
    occasion: "Birthday, Appreciation, General",
    flower: "Single Bloom",
    style: "Elegant, Minimalist",
    duration: 20,
    quality: "HD",
    status: "Ready"
  }
];

async function seedDeploymentVideos() {
  console.log("🌱 DIGITAL BLOOM: Deploying 6 TOP performing video assets...");
  
  // First, let's check if we need to create a table or if it already exists
  console.log("Inserting video assets into vault...");
  
  const { data, error } = await supabase
    .from('video_vault_assets')
    .insert(DEPLOYMENT_VIDEO_ASSETS);

  if (error) {
    console.error('❌ Error deploying videos:', error);
    
    // If table doesn't exist, try the prompts table instead for now
    console.log("Trying alternative table structure...");
    const promptsData = DEPLOYMENT_VIDEO_ASSETS.map(asset => ({
      title: asset.title,
      text: asset.prompt,
      category: asset.category
    }));
    
    const { data: promptData, error: promptError } = await supabase
      .from('prompts')
      .insert(promptsData);
      
    if (promptError) {
      console.error('❌ Error with prompts table:', promptError);
    } else {
      console.log('✅ Successfully added video prompts to prompts table!');
    }
  } else {
    console.log('✅ Successfully deployed all 6 video assets to video vault!');
  }
}

seedDeploymentVideos();