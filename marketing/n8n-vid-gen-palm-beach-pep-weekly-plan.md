# vid_gen_palm_beach_pep — Plan (2 scene cuts · 1080p · product VO)

**Status:** BUILD IN PROGRESS — follow `marketing/n8n-vid-gen-palm-beach-pep-execute.md`  
**Workflow:** `vid_gen_palm_beach_pep`  
**Sheet / CSV:** `150-pb-pep-scenes` / `marketing/sheets/150-pb-pep-scenes.csv`  
**Length:** **two ~30s 1080p scene cuts** (not four, not one blended 60s)  
**Character lock:** canonical Pep master via `/v1/images/edits` (`n8n-pep-character-lock.md`)  
**Video stack:** ElevenLabs TTS + **fal OmniHuman v1.5** talking clip (`n8n-pep-lipsync-setup.md`). Kling I2V is optional walk B-roll only.

---

## Decision lock (Sal)
- **2 Pep stills / 2 OmniHuman clips** (fewer cuts)
- Each clip is its **own scene**, not one smooth 60s film
- Spoken VO is **product talk only** — compliance/disclaimer stays on captions
- Keep **EXACT** canvas node names (do not rename)
- **Identical Pep** every still = master `https://files.catbox.moe/2yfdbi.jpg` as `pep_ref_url`
- **Cartoon-friendly motion** via **OmniHuman v1.5** (image + ElevenLabs audio). Kling I2V stays optional walk B-roll only.

---

## EXACT node names (locked)

```text
get_rows_in_sheet
  → filter_active
  → sort_rotation
  → Limit
  → Prep_day_variant
  → GROK_API
  → Parse_Grok
  → if_complaince
       true → prep_pep_beats
              → split_pep_beats
              → tts_pep_voice_over
              → grok_imagine_reel_still
              → save_still_url
              → prep_pep_lipsync
              → pep_lipsync_fal
              → save_lipsync_video_url
              → gather_pep_clips
              → sheets_update_creation
```

Do **not** rename these. Do **not** duplicate `_b/_c/_d` still nodes. `(split_pep_beats)` runs the talking chain **twice**.

---

## 2 scene cuts

| Still | Scene | Window |
|---|---|---|
| A | Scene A | ~0–30s |
| B | Scene B (new pose) | ~30–60s |

Each still is a starting image of Pep for that cut → **ElevenLabs speaks that scene’s slice of the row’s sheet `voice_over`** (`split_pep_beats.tts_text`) after stripping caption-only compliance → OmniHuman talks to that audio. Two unique poses so Pep does not drift.

---

## Execute docs
See **`marketing/n8n-vid-gen-palm-beach-pep-execute.md`** for step-by-step build order and smoke checks.

Support files:
- `marketing/n8n-pep-elevenlabs-video.md` — video provider lock + fal wiring
- `marketing/n8n-pep-prep-beats.js`
- `marketing/n8n-pep-prep-video-beat.js`
- `marketing/n8n-pep-grok-still-body.txt`
- `marketing/n8n-pep-save-outputs.txt`
- `marketing/n8n-pep-sheets-update.txt`
- `marketing/n8n-pep-stitch-notes.md`

---

## Hard rules
- Separate from `vid_gen_landscape_scenes` and original spotlight
- Node names: `lower_case_with_underscores`
- Spreadsheet: only touch tabs Sal names exactly (`150-pb-pep-scenes`, `pep-blocking-pool`)
- After CSV updates: always send hard GitHub link
- Aspect **9:16** · research-use disclaimer on **captions only**, never spoken
