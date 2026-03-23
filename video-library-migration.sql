-- ============================================================
-- Digital Bloom — Video Library Table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create the video_library table
create table if not exists video_library (
  id              uuid primary key default gen_random_uuid(),
  category        text not null,
  style_name      text default 'General',
  scene_number    int  default 1,
  total_scenes    int  default 7,
  filename        text,                 -- auto-generated name, e.g. DB_Birthday_GoldenRose_S01of07_Mar2026.mp4
  storage_url     text,                 -- Supabase Storage URL (if uploaded through the app)
  prompt_text     text,                 -- the exact Grok prompt used for this scene
  status          text default 'draft'
    check (status in ('draft', 'ready', 'filed', 'on_site')),
  notes           text,                 -- Ak's notes
  openclaw_notes  text,                 -- notes OpenClaw writes back when it processes the video
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Status meanings:
--   draft    = just logged by Ak, might still be generating more scenes
--   ready    = Ak is done with this batch, wants OpenClaw to process it
--   filed    = OpenClaw organized it (renamed, moved to right folder)
--   on_site  = video is live on digitabloom.com

-- 2. Row Level Security — allow full access (tighten later with auth)
alter table video_library enable row level security;

create policy "Allow all operations on video_library"
  on video_library
  for all
  using (true)
  with check (true);

-- 3. Create the Supabase Storage bucket for video files
insert into storage.buckets (id, name, public)
values ('video-library', 'video-library', false)
on conflict (id) do nothing;

-- 4. Storage policy — allow read/write to the bucket
create policy "Allow all storage operations"
  on storage.objects
  for all
  using (bucket_id = 'video-library')
  with check (bucket_id = 'video-library');

-- ============================================================
-- After running this, test with:
-- select * from video_library limit 5;
-- ============================================================
