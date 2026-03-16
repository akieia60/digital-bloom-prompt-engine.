import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljzlkphwkgyavqmoremg.supabase.co';
const supabaseKey = 'sb_publishable__Sr5gde3mSsMW_PvNu2Kiw_O1EZslhp';
const supabase = createClient(supabaseUrl, supabaseKey);

const DAILY_CATEGORY_PROMPTS = [
  // BIRTHDAY BLOOM
  { title: "Birthday Bloom - Scene 1", text: "bright joyful birthday celebration scene, colorful balloons floating upward, elegant birthday card resting on a decorated table with confetti, beautiful lettering reading \"Happy Birthday\", warm festive lighting, cinematic greeting card commercial style, ultra realistic", category: "Birthday" },
  { title: "Birthday Bloom - Scene 2", text: "the birthday card slowly opens revealing the message \"Happy Birthday\", colorful balloons floating upward behind the card, confetti drifting through the air, joyful celebration atmosphere, cinematic lighting", category: "Birthday" },
  { title: "Birthday Bloom - Scene 3", text: "behind the open card a brightly wrapped birthday gift box appears on the table with ribbon and bow, glowing softly as confetti swirls around it", category: "Birthday" },
  { title: "Birthday Bloom - Scene 4", text: "the birthday gift box slowly opens releasing glowing light, vibrant mixed flowers bloom upward in slow motion, colorful petals drifting through the air", category: "Birthday" },
  { title: "Birthday Bloom - Scene 5", text: "the blooming flowers fill the frame surrounded by floating balloons and confetti, elegant message fading in reading \"Happy Birthday\"", category: "Birthday" },

  // LOVE BLOOM
  { title: "Love Bloom - Scene 1", text: "romantic candlelit scene, soft glowing lights, elegant love card resting on a marble table surrounded by rose petals, beautiful lettering reading \"For You\", cinematic romantic lighting", category: "Love" },
  { title: "Love Bloom - Scene 2", text: "the romantic card slowly opens revealing the message \"I Love You\", soft candlelight glowing across the page, rose petals drifting through the air", category: "Love" },
  { title: "Love Bloom - Scene 3", text: "a luxurious ribbon wrapped gift box appears behind the open card glowing softly in warm romantic light", category: "Love" },
  { title: "Love Bloom - Scene 4", text: "the gift box slowly opens revealing elegant red roses blooming upward in slow motion, petals unfolding beautifully", category: "Love" },
  { title: "Love Bloom - Scene 5", text: "red roses fill the frame surrounded by drifting petals and warm candlelight, elegant message fading in reading \"I Love You\"", category: "Love" },

  // THINKING OF YOU BLOOM
  { title: "Thinking of You Bloom - Scene 1", text: "peaceful morning sunlight through a window, elegant greeting card resting on a wooden table beside flowers, delicate lettering reading \"Thinking Of You\"", category: "Thinking Of You" },
  { title: "Thinking of You Bloom - Scene 2", text: "the card slowly opens revealing the message \"Just Thinking Of You\", warm sunlight glowing across the page", category: "Thinking Of You" },
  { title: "Thinking of You Bloom - Scene 3", text: "a soft pastel gift box appears behind the open card glowing gently in morning light", category: "Thinking Of You" },
  { title: "Thinking of You Bloom - Scene 4", text: "the gift box opens revealing beautiful pink tulips blooming upward in slow motion", category: "Thinking Of You" },
  { title: "Thinking of You Bloom - Scene 5", text: "tulips fill the frame surrounded by drifting petals and soft glowing sunlight creating a peaceful emotional moment", category: "Thinking Of You" },

  // THANK YOU BLOOM
  { title: "Thank You Bloom - Scene 1", text: "beautiful elegant desk scene with natural sunlight, a thank you card resting on a polished table, delicate lettering reading \"Thank You\"", category: "Thank You" },
  { title: "Thank You Bloom - Scene 2", text: "the card slowly opens revealing the message \"Thank You So Much\", soft warm light illuminating the message", category: "Thank You" },
  { title: "Thank You Bloom - Scene 3", text: "a glowing gift box wrapped with ribbon appears behind the open card on the table", category: "Thank You" },
  { title: "Thank You Bloom - Scene 4", text: "the gift box opens revealing elegant white lilies blooming upward in slow motion", category: "Thank You" },
  { title: "Thank You Bloom - Scene 5", text: "white lilies fill the frame surrounded by soft glowing light as elegant text fades in reading \"Thank You\"", category: "Thank You" },

  // CONGRATULATIONS BLOOM
  { title: "Congratulations Bloom - Scene 1", text: "celebratory elegant scene with golden light and floating confetti, congratulations card resting on a polished table, lettering reading \"Congratulations\"", category: "Congratulations" },
  { title: "Congratulations Bloom - Scene 2", text: "the card opens revealing the message \"Congratulations\", golden confetti drifting through the air", category: "Congratulations" },
  { title: "Congratulations Bloom - Scene 3", text: "a luxury gift box wrapped with gold ribbon appears glowing behind the card", category: "Congratulations" },
  { title: "Congratulations Bloom - Scene 4", text: "the gift box opens revealing vibrant sunflowers blooming upward", category: "Congratulations" },
  { title: "Congratulations Bloom - Scene 5", text: "sunflowers fill the frame surrounded by golden light and confetti creating a joyful finale", category: "Congratulations" },

  // SYMPATHY BLOOM
  { title: "Sympathy Bloom - Scene 1", text: "peaceful calm scene with soft diffused light, elegant sympathy card resting on a marble surface, delicate lettering reading \"With Sympathy\"", category: "Sympathy" },
  { title: "Sympathy Bloom - Scene 2", text: "the card slowly opens revealing the message \"Thinking Of You During This Time\"", category: "Sympathy" },
  { title: "Sympathy Bloom - Scene 3", text: "a gentle glowing gift box appears behind the card surrounded by soft drifting petals", category: "Sympathy" },
  { title: "Sympathy Bloom - Scene 4", text: "the gift box opens revealing elegant white orchids blooming upward slowly", category: "Sympathy" },
  { title: "Sympathy Bloom - Scene 5", text: "white orchids fill the frame in peaceful soft light creating a calm respectful floral moment", category: "Sympathy" }
];

async function seedDailyPrompts() {
  console.log("Inserting Daily Category Pack...");
  const { data, error } = await supabase
    .from('prompts')
    .insert(DAILY_CATEGORY_PROMPTS);

  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log(`Successfully added ${DAILY_CATEGORY_PROMPTS.length} daily category prompts!`);
  }
}

seedDailyPrompts();
