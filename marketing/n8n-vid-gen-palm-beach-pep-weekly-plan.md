# vid_gen_palm_beach_pep — Plan (4 stills · ~60s · VO)

**Status:** BUILD IN PROGRESS — follow `marketing/n8n-vid-gen-palm-beach-pep-execute.md`  
**Workflow:** `vid_gen_palm_beach_pep`  
**Sheet / CSV:** `150-pb-pep-scenes` / `marketing/sheets/150-pb-pep-scenes.csv`  
**Length:** **~60 seconds** (4× ~15s beats + ElevenLabs TTS)  
**Character lock:** canonical Pep master via `/v1/images/edits` (`n8n-pep-character-lock.md`)  
**Video stack:** ElevenLabs TTS + **fal OmniHuman v1.5** talking clip (`n8n-pep-lipsync-setup.md`). Kling I2V is optional walk B-roll only.

---

## Decision lock (Sal)
- **4 Pep stills** (not 8)
- **~1 minute** final cut
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
              → grok_imagine_reel_still
              → save_still_url
              → prep_pep_lipsync
              → pep_lipsync_fal
              → save_lipsync_video_url
              → sheets_update_creation
```

Do **not** rename these. Add Beat B–D only as suffixed duplicates (`*_b`, `*_c`, `*_d`).

---

## 4 stills meaning

| Still | Beat | Window |
|---|---|---|
| A | Hook | 0–15s |
| B | Product | 15–30s |
| C | World | 30–45s |
| D | Close + disclaimer energy | 45–60s |

Each still is a starting image of Pep for that beat → animated with **fal Kling v3 Pro I2V** → stitched + ElevenLabs VO.

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
- Spreadsheet: only touch tab Sal names exactly (`150-pb-pep-scenes`)
- After CSV updates: always send hard GitHub link
- Aspect **9:16** · research-use disclaimer exact in VO + captions
