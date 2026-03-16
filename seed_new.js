import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljzlkphwkgyavqmoremg.supabase.co';
const supabaseKey = 'sb_publishable__Sr5gde3mSsMW_PvNu2Kiw_O1EZslhp';
const supabase = createClient(supabaseUrl, supabaseKey);

const NEW_PROMPTS = [
  // Mother's Day Bloom 1 - Marble Rose Luxury
  { title: "MD Bloom 1: Marble Rose Luxury - Scene 1", text: "luxury white marble table with soft gold veins, elegant Mother's Day greeting card resting in the center, embossed floral design on the cover, beautiful lettering reading \"Happy Mother's Day\", soft cinematic lighting, flower petals gently drifting across the marble surface, luxury greeting card commercial style, ultra realistic", category: "Mother's Day" },
  { title: "MD Bloom 1: Marble Rose Luxury - Scene 2", text: "the elegant Mother's Day card slowly opens revealing the message \"Happy Mother's Day Mom\", warm golden light glowing from inside the card, three soft pastel balloons floating upward behind the card, delicate butterflies gliding through the air, cinematic luxury lighting, ultra realistic", category: "Mother's Day" },
  { title: "MD Bloom 1: Marble Rose Luxury - Scene 3", text: "behind the open card a luxurious gift box wrapped with a silk ribbon slowly appears on the marble table, glowing softly as petals swirl around it, three pastel balloons floating nearby, cinematic commercial lighting", category: "Mother's Day" },
  { title: "MD Bloom 1: Marble Rose Luxury - Scene 4", text: "the luxury gift box slowly opens releasing glowing light, elegant bouquet of 48 red roses bloom upward and outward towards the viewer in slow motion, petals unfolding beautifully, drifting through the air, cinematic floral reveal, ultra realistic", category: "Mother's Day" },
  { title: "MD Bloom 1: Marble Rose Luxury - Scene 5", text: "the blooming roses fill the frame surrounded by drifting petals and butterflies, soft golden sunlight glowing across the flowers, elegant text fading in reading \"Happy Mother's Day\", cinematic emotional finale", category: "Mother's Day" },

  // Mother's Day Bloom 2 - Spring Garden Morning
  { title: "MD Bloom 2: Spring Garden - Scene 1", text: "sunlit spring garden scene, wooden garden table surrounded by blooming flowers, a beautiful handmade Mother's Day card resting on the table, watercolor floral design on the cover, elegant lettering reading \"Happy Mother's Day\", gentle breeze moving petals across the table, cinematic natural lighting", category: "Mother's Day" },
  { title: "MD Bloom 2: Spring Garden - Scene 2", text: "the Mother's Day card slowly opens revealing the message \"Happy Mother's Day Mama\", warm golden sunlight shining across the page, three pastel balloons floating upward behind the table, butterflies moving through the garden air", category: "Mother's Day" },
  { title: "MD Bloom 2: Spring Garden - Scene 3", text: "behind the open card a pastel ribbon wrapped gift box appears on the table surrounded by flower petals, glowing softly in warm sunlight, dreamy spring garden environment", category: "Mother's Day" },
  { title: "MD Bloom 2: Spring Garden - Scene 4", text: "the pastel gift box slowly opens revealing lush pink peonies blooming upward in slow motion, large soft petals unfolding beautifully, petals drifting through the air", category: "Mother's Day" },
  { title: "MD Bloom 2: Spring Garden - Scene 5", text: "the blooming peonies fill the frame surrounded by sunlight, butterflies and drifting petals, elegant message fading in reading \"Happy Mother's Day\"", category: "Mother's Day" },

  // Mother's Day Bloom 3 - Golden Sunset Bloom
  { title: "MD Bloom 3: Golden Sunset - Scene 1", text: "beautiful sunset sky overlooking a peaceful lake, golden light reflecting on the water, a luxurious Mother's Day card resting on a polished wooden dock, elegant gold foil lettering reading \"Happy Mother's Day\", warm cinematic sunset lighting", category: "Mother's Day" },
  { title: "MD Bloom 3: Golden Sunset - Scene 2", text: "the elegant Mother's Day card slowly opens revealing the message \"Happy Mother's Day Mom\", golden sunset light glowing across the page, three elegant balloons drifting upward beside the dock", category: "Mother's Day" },
  { title: "MD Bloom 3: Golden Sunset - Scene 3", text: "behind the open card a luxurious gift box wrapped with satin ribbon appears glowing softly in the warm sunset light", category: "Mother's Day" },
  { title: "MD Bloom 3: Golden Sunset - Scene 4", text: "the gift box slowly opens revealing elegant white orchids blooming upward in slow motion, petals unfolding gracefully in the sunset glow", category: "Mother's Day" },
  { title: "MD Bloom 3: Golden Sunset - Scene 5", text: "the blooming orchids fill the frame against a glowing sunset sky, petals drifting through warm light, elegant message fading in reading \"Happy Mother's Day\"", category: "Mother's Day" },

  // Apple Intelligence Prompts / Idea Generators
  { title: "Apple Intelligence Refine Guide", text: "Use these phrases to quickly modify a prompt on your phone:\n- Rewrite this prompt using [flower] instead of roses.\n- Rewrite this prompt so the scene takes place in a [environment].\n- Rewrite this prompt but change the message on the card to '[message]'.", category: "Workflow" },
  { title: "Flower Swap List", text: "Roses, Peonies, Tulips, Orchids, Sunflowers, Lilies, Lavender, Cherry blossoms, Hibiscus, Hydrangeas", category: "Workflow" }
];

async function seedNewPrompts() {
  console.log("Inserting new Mother's Day prompts...");
  const { data, error } = await supabase
    .from('prompts')
    .insert(NEW_PROMPTS);

  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log('Successfully added all new prompts!');
  }
}

seedNewPrompts();
