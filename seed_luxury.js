import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljzlkphwkgyavqmoremg.supabase.co';
const supabaseKey = 'sb_publishable__Sr5gde3mSsMW_PvNu2Kiw_O1EZslhp';
const supabase = createClient(supabaseUrl, supabaseKey);

const LUXURY_PROMPTS = [
  // Hero Bloom Videos (15-30 sec)
  {
    title: "Luxury 1: Crystal Stiletto Bloom Unfurl",
    text: "A crystal-encrusted stiletto heel sits on polished black marble. In ultra-slow motion, deep crimson roses begin blooming from inside the shoe, petals unfurling one by one. White orchids with gold-dusted edges emerge between the roses. Gold sparkle particles drift through the air like diamond dust. The crystals on the shoe catch the light and create tiny rainbow refractions. Camera slowly orbits the shoe. Cinematic luxury fashion film, dramatic side lighting, black background, 4K.\n\n📸 Reference: /images/luxury/01_crystal_bloom_unfurl.png",
    category: "Luxury Collection"
  },
  {
    title: "Luxury 2: Crystal Stiletto Rose Cascade",
    text: "Extreme close-up on a crystal stiletto high heel on a dark reflective surface. Roses in shades of deep red and blush pink slowly cascade out of the shoe opening, each petal catching golden light. Tiny gold leaf particles float weightlessly in the air. The crystals on the shoe shimmer and sparkle as the camera slowly pans upward. Luxury brand commercial aesthetic, shallow depth of field, bokeh highlights, magazine-quality lighting.\n\n📸 Reference: /images/luxury/02_rose_cascade.png",
    category: "Luxury Collection"
  },
  {
    title: "Luxury 3: Fashion Meets Flora Transformation",
    text: "A glamorous crystal stiletto sits alone on black velvet, lit by a single dramatic spotlight. Suddenly, lush flowers begin emerging — crimson roses, white orchids, purple peonies — filling and overflowing the shoe in elegant slow motion. Gold dust swirls around the arrangement. Petals gently fall and float. The lighting shifts from cool silver to warm gold. Ultra-luxury fashion commercial, cinematic 4K, dramatic and sensual mood.\n\n📸 Reference: /images/luxury/03_fashion_meets_flora.png",
    category: "Luxury Collection"
  },

  // Category Preview Loops (5-8 sec)
  {
    title: "Luxury 4: Quick Sparkle Loop (Preview)",
    text: "A crystal stiletto overflowing with red roses and white orchids on black marble. Subtle animation: gold sparkles drift through the air, crystals shimmer, light slowly shifts creating moving reflections. Dreamy, hypnotic loop. Luxury product showcase, 3-5 second seamless loop.\n\n📸 Reference: /images/luxury/04_sparkle_loop.png",
    category: "Luxury Collection"
  },
  {
    title: "Luxury 5: Petal Fall Loop (Preview)",
    text: "Close-up of a crystal high heel filled with blooming roses. A few petals slowly detach and float downward in slow motion while gold dust particles drift upward. Dramatic dark background with warm rim lighting. Seamless looping video, 5 seconds, luxury brand aesthetic.\n\n📸 Reference: /images/luxury/05_petal_fall.png",
    category: "Luxury Collection"
  },

  // Additional Product Variations
  {
    title: "Luxury 6: Glass Slipper Collection",
    text: "A transparent glass stiletto heel on a black mirror surface, filled with an arrangement of black roses with gold-tipped petals. Gold butterflies slowly emerge from between the flowers. Dramatic spotlighting creates long shadows. Smoke wisps curl around the base. Ultra-luxury dark fantasy aesthetic, 4K cinematic.\n\n📸 Reference: /images/luxury/06_glass_slipper.png",
    category: "Luxury Collection"
  },
  {
    title: "Luxury 7: Diamond Heel Rose Garden",
    text: "Multiple crystal stiletto heels arranged in a row, each containing different colored roses — one with deep red, one with pure white, one with black and gold. Camera dolly moves along the row revealing each shoe. Gold sparkle particles connect between them. Luxury fashion runway commercial, dramatic lighting, black background.\n\n📸 Reference: /images/luxury/07_diamond_heel_row.png",
    category: "Luxury Collection"
  },
  {
    title: "Luxury 8: Stiletto Bloom Explosion",
    text: "A single crystal stiletto on a dark pedestal. After a moment of stillness, flowers dramatically burst from the shoe top — roses, peonies, orchids, and wildflowers in rich jewel tones. Petals scatter in slow motion. Gold dust clouds expand outward. The crystal shoe catches every light. Cinematic slow-motion luxury advertisement, 4K.\n\n📸 Reference: /images/luxury/08_bloom_explosion.png",
    category: "Luxury Collection"
  },
];

async function seedLuxuryPrompts() {
  console.log("Inserting 8 Luxury Collection prompts...");
  const { data, error } = await supabase
    .from('prompts')
    .insert(LUXURY_PROMPTS);

  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log('✅ Successfully added all 8 Luxury Collection prompts!');
  }
}

seedLuxuryPrompts();
