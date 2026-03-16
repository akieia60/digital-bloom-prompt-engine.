import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljzlkphwkgyavqmoremg.supabase.co';
const supabaseKey = 'sb_publishable__Sr5gde3mSsMW_PvNu2Kiw_O1EZslhp';
const supabase = createClient(supabaseUrl, supabaseKey);

const INITIAL_PROMPTS = [
  { title: 'Hero Theme', text: 'Create a dynamic 15-second video highlighting the Hero theme with vibrant energetic colors, fast cuts, and powerful cinematic lighting. Include bold typography for the Digital Bloom opening.', category: 'Hero' },
  { title: 'Mothers Day', text: 'Produce a gentle, warm Mother Day themed video. Soft pastel colors, blooming flowers, and elegant smooth transitions. The mood should be heartfelt and organic.', category: 'Celebration' },
  { title: 'Photo Bloom Experience', text: 'Generate an interactive photo montage. Transition through 5 portrait photos using the "bloom" effect where the background bursts with customized floral patterns based on the subjects clothing.', category: 'Custom' },
  { title: 'Narrative Gift', text: 'Craft a narrative-driven gift reveal. Start with a mysterious wrapped box that slowly unfolds in a magical glowing effect, revealing the Digital Bloom core message inside. Whimsical background music.', category: 'Custom' }
];

async function seed() {
  console.log('Inserting initial prompts...');
  const { data, error } = await supabase
    .from('prompts')
    .insert(INITIAL_PROMPTS);

  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log('Successfully added initial prompts!');
  }
}

seed();
