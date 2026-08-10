# vid_gen_palm_beach_pep — Plan (4 stills · ~60s · VO)

**Status:** BUILD STARTED — follow `marketing/n8n-vid-gen-palm-beach-pep-execute.md` (Phase 0 → A first)  
**Workflow:** `vid_gen_palm_beach_pep`  
**Sheet / CSV:** `150-pb-pep-scenes` / `marketing/sheets/150-pb-pep-scenes.csv`  
**Length:** **~60 seconds** (4× ~15s beats + TTS voiceover)  
**Character lock:** canonical Pep master PNG via `/v1/images/edits` (`n8n-pep-character-lock.md`)

---

## Decision lock (Sal)
- **4 Pep stills** (not 8)
- **~1 minute** final cut
- **Duplicate nodes** from current landscape video sequence
- Build in a **duplicated** workflow renamed `vid_gen_palm_beach_pep` — do not edit live landscape
- **Identical Pep** every still = one master reference image (`pep_ref_url`), not text-only regen

---

## Current landscape sequence → Pep mapping

| Current node | Pep action |
|---|---|
| Schedule Trigger | Keep (disable until smoke passes) |
| `get_rows_in_sheet` | Retarget to `150-pb-pep-scenes` |
| `filter_active` | Keep |
| `sort_rotation` | Keep |
| `Limit` | Keep (=1) — **single row lock** |
| `Prep_day_variant` | Rename → `prep_pep_breakdown` |
| `Edit Fields1` | Rename → `edit_fields_pep_caption` |
| `GROK_API` | Keep |
| `Parse_Grok` | Keep / adapt |
| `if_complaince` | Rename → `if_compliance` |
| `get_reel_creations` + `filter_creations_active` + `pick_creation` | **Remove** (prevents second-row mismatch) |
| `grok_imagine_reel_still` | Duplicate ×4 → `grok_pep_still_a`…`d` |
| `save_still_url` | Duplicate ×4 → `save_still_a`…`d` |
| `prep_grok_video_start` | Replace with `prep_pep_video_a`…`d` |
| `grok_video_start` | Duplicate ×4 |
| `grok_video_poll` | Duplicate ×4 + waits/IFs |
| `save_video_url` | Become `save_pep_outputs` |
| `sheets_update_creation` | Duplicate → `sheets_update_pep` |

**New:** `prep_pep_beats`, `tts_pep_voice_over`, `stitch_pep_master`

---

## 4 stills meaning

| Still | Beat | Window |
|---|---|---|
| A | Hook | 0–15s |
| B | Product | 15–30s |
| C | World | 30–45s |
| D | Close + disclaimer energy | 45–60s |

Each still is a starting image of Pep for that beat → animated with `grok-imagine-video-1.5` → stitched + VO.

---

## Execute docs
See **`marketing/n8n-vid-gen-palm-beach-pep-execute.md`** for step-by-step build order and smoke checks.

Support files:
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
