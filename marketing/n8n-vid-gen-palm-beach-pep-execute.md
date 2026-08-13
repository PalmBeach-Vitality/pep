# EXECUTE — `vid_gen_palm_beach_pep` (4 stills · ~60s · VO · locked Pep)

**Status:** BUILD IN PROGRESS — use **EXACT** canvas node names below  
**Length:** ~60s (4× ~15s) + ElevenLabs TTS  
**Sheet:** `150-pb-pep-scenes`  
**Character lock:** `marketing/n8n-pep-character-lock.md`  
**Video stack:** `marketing/n8n-pep-elevenlabs-video.md` (fal Kling I2V + ElevenLabs TTS)  
**Pep master:** `https://files.catbox.moe/2yfdbi.jpg`

---

## EXACT node names (current canvas — do not rename)

These are the **exact** n8n node names. All `$('…')` expressions and build steps must use them as written (including casing and the `if_complaince` spelling).

```text
Schedule Trigger
  → get_rows_in_sheet
  → filter_active
  → sort_rotation
  → Limit
  → Prep_day_variant
  → grok_api
  → parse_grok
  → if_complaince
       false → stop
       true  → prep_pep_beats
                 → tts_pep_voice_over
                 → fal_upload_tts_initiate
                 → merge_tts_binary
                 → fal_upload_tts_put
                 → save_tts_audio_url
                 → grok_imagine_reel_still
                 → save_still_url
                 → prep_grok_video_start
                 → kling_video_request
                 → Wait
                 → grok_video_poll
                 → kling_video_result
                 → save_video_url
                 → prep_pep_lipsync
                 → pep_lipsync_start
                 → Wait
                 → pep_lipsync_poll
                 → pep_lipsync_result
                 → save_lipsync_video_url
                 → sheets_update_creation
```

| # | Exact node name | Role |
|---|---|---|
| 1 | `get_rows_in_sheet` | Read Pep sheet |
| 2 | `filter_active` | Keep Active rows |
| 3 | `sort_rotation` | Rotation sort |
| 4 | `Limit` | One row only |
| 5 | `Prep_day_variant` | Map row fields + `pep_ref_url` |
| 6 | `grok_api` | Caption LLM |
| 7 | `parse_grok` | Parse caption JSON |
| 8 | `if_complaince` | Compliance gate (exact spelling) |
| 9 | `prep_pep_beats` | Build 4 beat briefs + VO splits |
| 10 | `tts_pep_voice_over` | ElevenLabs TTS (binary MP3) |
| 11 | `fal_upload_tts_initiate` | fal storage initiate → `file_url` |
| 12 | `merge_tts_binary` | Attach TTS binary onto fal upload |
| 13 | `fal_upload_tts_put` | PUT binary (`data`) to `upload_url` |
| 14 | `save_tts_audio_url` | Store public `tts_audio_url` |
| 15 | `grok_imagine_reel_still` | Pep still (Beat A first; DUP for B–D later) |
| 16 | `save_still_url` | Save still URL |
| 17 | `prep_grok_video_start` | Prep fal Kling I2V body (walk+talk lock) |
| 18 | `kling_video_request` | Start video (fal Kling queue) |
| 19 | `Wait` | Brief wait before poll |
| 20 | `grok_video_poll` | Poll fal until done |
| 21 | `kling_video_result` | Fetch fal result payload |
| 22 | `save_video_url` | Save silent Kling `video_url` |
| 23 | `prep_pep_lipsync` | Build lipsync body (unchanged) |
| 24 | `pep_lipsync_start` | fal sync-lipsync/v3 submit (unchanged) |
| 25 | `pep_lipsync_poll` | Poll lipsync until COMPLETED (unchanged) |
| 26 | `pep_lipsync_result` | Fetch lipsync result (unchanged) |
| 27 | `save_lipsync_video_url` | Save final `lipsync_video_url` |
| 28 | `sheets_update_creation` | Writeback |

**Hard rule:** Do not rename these nodes. When adding Beat B–D stills/videos, **duplicate** and use suffixed names only for the new copies (e.g. `grok_imagine_reel_still_b`), leaving the originals above intact.

If the lipsync submit node on canvas is already named `fal_lipsync_call` and the result node is `pep_lip_sync_result`, **keep those names**. Do not rewrite lipsync parameters.

---

## Phase 0 — Pep master LOCKED
**Master URL:** `https://files.catbox.moe/2yfdbi.jpg`  
**Repo backup:** `marketing/assets/palm-beach-pep-master.jpg`

On node **`Prep_day_variant`**, set field:

| Name | Value |
|---|---|
| `pep_ref_url` | `https://files.catbox.moe/2yfdbi.jpg` |

---

## Phase A — Sheet pick (exact names)
1. `get_rows_in_sheet` → tab **`150-pb-pep-scenes`**
2. Keep `filter_active` → `sort_rotation` → `Limit` (=1)
3. On `Prep_day_variant` (Include Other Input Fields = ON), ensure:

| Name | Value |
|---|---|
| `pep_ref_url` | `https://files.catbox.moe/2yfdbi.jpg` |
| `creation_id` | `{{ $json.creation_id }}` |
| `compound_id` | `{{ $json.compound_id }}` |
| `compound_name` | `{{ $json.compound_name }}` |
| `canonical_url` | `{{ $json.canonical_url }}` |
| `caption_lock` | `{{ $json.caption_lock }}` |
| `scene_brief` | `{{ $json.scene_brief }}` |
| `surface` | `{{ $json.surface }}` |
| `lighting` | `{{ $json.lighting }}` |
| `camera_move` | `{{ $json.camera_move }}` |
| `color_grade` | `{{ $json.color_grade }}` |
| `hero_style` | `{{ $json.hero_style }}` |
| `voice_over` | `{{ $json.voice_over }}` |
| `pep_script` | `{{ $json.pep_script }}` |
| `disclaimer_short` | `{{ $json.disclaimer_short }}` |
| `video_prompt` | `{{ $json.video_prompt }}` |
| `video_motion_prompt` | `{{ $json.video_motion_prompt }}` |

4. Smoke: Manual run through `Limit` → `Prep_day_variant`  
5. Paste: `creation_id`, `compound_name`, `pep_ref_url`

---

## Phase B — Captions + compliance (exact names)
| Exact node | Action |
|---|---|
| `grok_api` | Keep — captions from Prep fields / caption_lock |
| `parse_grok` | Expose `compliance_ok`, captions, `display_name` |
| `if_complaince` | **true** → `prep_pep_beats`; **false** → stop |

---

## Phase C — Locked Pep still (exact names first) — #1 PRIORITY
**Pep must match master exactly.** Master: `https://files.catbox.moe/2yfdbi.jpg`

1. `prep_pep_beats` — paste `marketing/n8n-pep-prep-beats.js`  
   - Reads `$('Prep_day_variant')` then `$('Limit')`
2. `grok_imagine_reel_still`
   - URL → **`https://api.x.ai/v1/images/edits`** (never `/generations`)
   - Body → **`marketing/n8n-pep-grok-still-body-lock.txt`** (EDIT `<IMAGE_0>` only)
   - Confirm request preview: `images[0].url` = master
3. `save_still_url` — save `reel_still_url` / `data[0].url`
4. **QC gate:** still vs master side-by-side. Face / hat logo / crimp / gloves / sneakers must match. Drift → reroll. Do not continue to video on a bad still.

**Then duplicate for 4 stills** (keep original names for A):

| Beat | Still node (exact / new) | Save node |
|---|---|---|
| A | `grok_imagine_reel_still` | `save_still_url` |
| B | `grok_imagine_reel_still_b` | `save_still_url_b` |
| C | `grok_imagine_reel_still_c` | `save_still_url_c` |
| D | `grok_imagine_reel_still_d` | `save_still_url_d` |

---

## Phase D — Cartoon video via fal Kling (exact names first)

**Why fal, not ElevenLabs HTTP:** ElevenLabs Image & Video / Flows is UI-only today (Flows API “coming soon”). We use **Kling v3 Pro I2V on fal** — same cartoon-strong model family — so n8n can run weekly.  

**Setup (account + key + n8n):** `marketing/n8n-pep-fal-kling-setup.md`  
**Stack note:** `marketing/n8n-pep-elevenlabs-video.md`

| Exact node | Action |
|---|---|
| `prep_grok_video_start` | Paste `marketing/n8n-pep-prep-video-beat.js` (BEAT=`a`). Walk+talk lock. Outputs `video_request_body` for fal Kling |
| `kling_video_request` | Full HTTP params in `marketing/n8n-pep-full-paste-codes.md` · POST queue · body `={{ $json.video_request_body }}` |
| `Wait` | Brief wait before poll |
| `grok_video_poll` | Poll fal status until COMPLETED |
| `kling_video_result` | GET `response_url` only after COMPLETED |
| `save_video_url` | Save silent Kling `video_url` from `video.url` |
| `prep_pep_lipsync` → `pep_lipsync_start` → Wait → `pep_lipsync_poll` → `pep_lipsync_result` → `save_lipsync_video_url` | **Unchanged.** Keep this chain. Mouth motion comes from the Kling clip. |

Duplicate pattern for beats B–D after A works:
`prep_grok_video_start_b` → `kling_video_request_b` → `grok_video_poll_b` → …  
(same for c/d)

**Sheet field:** `model_video` = `fal-kling-v3-pro-i2v`

---

## Phase E — ElevenLabs TTS + lipsync (same workflow)
TTS and lipsync already sit on this canvas. Do not split them out.  
See `marketing/n8n-pep-stitch-notes.md` and `marketing/n8n-pep-lipsync-setup.md`.  
A→B→C→D concat (~60s) waits until Beat A lipsync looks right.

---

## Phase F — Writeback (exact name)
| Exact node | Action |
|---|---|
| `sheets_update_creation` | Update tab **`150-pb-pep-scenes`** · match `creation_id` · `last_used_at`, `times_used`, `reel_still_url`, `video_url` |

Mapping helper: `marketing/n8n-pep-sheets-update.txt` (expressions use these exact names).

---

## Expression cheat sheet (exact names)

```text
$('get_rows_in_sheet')
$('filter_active')
$('sort_rotation')
$('Limit')
$('Prep_day_variant')
$('GROK_API')
$('Parse_Grok')
$('if_complaince')
$('prep_pep_beats')
$('tts_pep_voice_over')
$('fal_upload_tts_initiate')
$('merge_tts_binary')
$('fal_upload_tts_put')
$('save_tts_audio_url')
$('grok_imagine_reel_still')
$('save_still_url')
$('prep_grok_video_start')
$('kling_video_request')
$('grok_video_poll')
$('kling_video_result')
$('save_video_url')
$('prep_pep_lipsync')
$('pep_lipsync_start')
$('pep_lipsync_poll')
$('pep_lipsync_result')
$('save_lipsync_video_url')
$('sheets_update_creation')
```

---

## Support files
| File | Use |
|---|---|
| `marketing/n8n-pep-elevenlabs-video.md` | ElevenLabs intent + fal Kling wiring |
| `marketing/n8n-pep-prep-beats.js` | Code for `prep_pep_beats` |
| `marketing/n8n-pep-grok-still-body.txt` | Body for `grok_imagine_reel_still` (+ _b/_c/_d) |
| `marketing/n8n-pep-prep-video-beat.js` | Template for fal Kling video prep (set BEAT) |
| `marketing/n8n-pep-save-outputs.txt` | Optional expanded save fields |
| `marketing/n8n-pep-sheets-update.txt` | `sheets_update_creation` mapping |
| `marketing/n8n-pep-stitch-notes.md` | ElevenLabs TTS + stitch |
| `marketing/n8n-pep-character-lock.md` | Master likeness rules |
