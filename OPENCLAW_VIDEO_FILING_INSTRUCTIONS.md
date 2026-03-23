# OpenClaw — Video Filing Instructions

> Read this entire file. This is your job description for handling Ak's video library.

---

## WHAT AK IS DOING (understand this first)

Ak generates videos using Grok. The process takes a long time — each scene is generated one at a time, and a full sequence is 7 scenes extended to ~30 seconds. When Ak is on the road, videos end up on the phone camera roll or uploaded through the prompt engine app.

Your job is to be the person who organizes everything so Ak doesn't have to think about it.

---

## WHEN AK MESSAGES YOU

Ak will message you something like:
- "I have 3 new videos logged, please file them"
- "Videos are ready in the library, can you process them?"
- "Done generating today's batch, check the library"

When you get this message, follow the steps below. Do not wait for more instructions — just do it and report back.

---

## YOUR FILING PROCESS (step by step)

### Step 1 — Check Supabase for ready videos

Query the `video_library` table for all records with status = 'ready':

```sql
select id, category, style_name, scene_number, total_scenes, filename, storage_url, notes, created_at
from video_library
where status = 'ready'
order by created_at asc;
```

### Step 2 — Verify the naming convention

Each video should already have an auto-generated filename from the app:
`DB_[Category]_[Style]_S[##]of[##]_[MonYYYY].mp4`

Examples of correct filenames:
- `DB_Birthday_GoldenRose_S01of07_Mar2026.mp4`
- `DB_MothersDay_Garden_S03of07_Mar2026.mp4`
- `DB_Sympathy_Serene_S07of07_Mar2026.mp4`

If a filename looks wrong or is missing, generate the correct one using the fields in the record.

### Step 3 — Check if video is in Supabase Storage

If `storage_url` is not null, the video was uploaded through the app and is already in Supabase Storage at the path `video-library/videos/[filename]`. This is good — no action needed for storage.

If `storage_url` is null, the video was not uploaded yet. Note this in your report to Ak — she will need to upload it manually before it can go on the site.

### Step 4 — Update the record status to 'filed'

For each video you have processed, update its status:

```sql
update video_library
set
  status = 'filed',
  openclaw_notes = '[your notes about what you did]',
  updated_at = now()
where id = '[the record id]';
```

Write a brief openclaw_notes entry for each record, for example:
- "Filed. Filename verified: DB_Birthday_GoldenRose_S01of07_Mar2026.mp4. Video is in Supabase Storage."
- "Filed. No video file uploaded yet — Ak needs to upload from camera roll."
- "Filed. All 7 scenes logged for Birthday/GoldenRose sequence. Ready for site upload."

### Step 5 — Report back to Ak

Send a summary message on Telegram. Keep it short and clear. Include:
- How many videos were filed
- Which categories / styles
- Any that are missing video files (need upload)
- Whether any complete sequences (all scenes logged) are ready to add to the site

**Example report:**
```
Done! Filed 3 videos:
✅ Birthday / Golden Rose — Scene 1 of 7 (video uploaded)
✅ Birthday / Golden Rose — Scene 2 of 7 (video uploaded)
⚠️ Mother's Day / Garden — Scene 1 of 7 (no video file yet — upload from camera roll when ready)

One note: Birthday/GoldenRose has 2 of 7 scenes filed so far — needs 5 more before it's a complete sequence.
```

---

## WHEN A FULL SEQUENCE IS COMPLETE

A sequence is complete when all scenes (1 through total_scenes) for the same category + style are filed and have storage_url filled in.

When you detect this:
1. Note it clearly in your report to Ak
2. Update all the records in that sequence: `openclaw_notes = 'SEQUENCE COMPLETE — ready to add to site'`
3. Ask Ak: "The Birthday/GoldenRose 7-scene sequence is complete. Should I mark it ready for the site?"

If Ak says yes, update all records to `status = 'on_site'`.

---

## WHAT YOU SHOULD NEVER DO

- Do NOT delete any records from video_library
- Do NOT change the filename from what the app generated (unless it's clearly wrong)
- Do NOT mark status = 'on_site' without Ak's explicit approval
- Do NOT make changes to the main digital-bloom repo when working on video library tasks

---

## REFERENCE — Naming Convention

Format: `DB_[Category]_[Style]_S[##]of[##]_[MonYYYY].mp4`

| Part | Example | Rule |
|------|---------|------|
| `DB` | `DB` | Always first, always uppercase |
| Category | `Birthday` | No spaces, no special chars |
| Style | `GoldenRose` | CamelCase, no spaces |
| Scene | `S01of07` | Zero-padded, format is always S##of## |
| Month/Year | `Mar2026` | 3-letter month + full year |

---

## REFERENCE — Status meanings

| Status | Meaning |
|--------|---------|
| `draft` | Just logged by Ak, not ready yet |
| `ready` | Ak says process this |
| `filed` | You have processed it |
| `on_site` | Live on digitabloom.com (Ak approves this) |
