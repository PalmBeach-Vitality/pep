# EXECUTE — `vid_gen_palm_beach_pep` (4 stills · ~60s · VO · locked Pep)

**Status:** START BUILD HERE  
**Length:** ~60s (4× ~15s) + TTS  
**Sheet:** `150-pb-pep-scenes`  
**Character lock:** `marketing/n8n-pep-character-lock.md`

---

## START NOW — Phase 0 + Phase A (today)

### Phase 0 — Lock Pep master (required for identical likeness)
1. Export the official Pep PNG (full body, clean bg).
2. Host at a **stable public image URL**.
3. Keep that URL handy — you will paste it into `pep_ref_url`.

> Without this URL, still nodes must not run. Text-only Pep regenerates and **will drift**.

### Phase A — Duplicate workflow + one-row pick
1. In n8n: open your current landscape video workflow (screenshot sequence).
2. **⋯ → Duplicate** → rename **`vid_gen_palm_beach_pep`**.
3. Disable Schedule (use Manual Trigger while building).
4. On `get_rows_in_sheet`: point to tab **`150-pb-pep-scenes`**.
5. Keep `filter_active` → `sort_rotation` → `Limit` (=1).
6. **Delete / disconnect** `get_reel_creations` → `filter_creations_active` → `pick_creation`.
7. Rename `Prep_day_variant` → **`prep_pep_breakdown`**.
8. In `prep_pep_breakdown` add fields (Include Other Input Fields = ON):

| Name | Value |
|---|---|
| `pep_ref_url` | `https://YOUR-HOST/palm-beach-pep-master.png` ← paste real URL |
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

9. Manual run through `Limit` → `prep_pep_breakdown`.
10. Paste smoke result here: `creation_id`, `compound_name`, `pep_ref_url` (confirm URL loads in browser).

**Done when:** one Pep row + master URL locked.

---

## Phase B — Captions + compliance (next)
| Node | Action |
|---|---|
| `edit_fields_pep_caption` | Rename `Edit Fields1`; force `caption_lock` + disclaimer |
| `GROK_API` | Keep |
| `Parse_Grok` | Keep / expose `compliance_ok`, captions, `display_name` |
| `if_compliance` | Rename from `if_complaince`; false → stop |

---

## Phase C — 4 locked Pep stills (character consistency)
1. Add Code node **`prep_pep_beats`** after compliance true  
   - Paste `marketing/n8n-pep-prep-beats.js`
2. **DUPLICATE** `grok_imagine_reel_still` → `grok_pep_still_a`
   - Change URL to **`https://api.x.ai/v1/images/edits`**
   - Paste Beat A body from `marketing/n8n-pep-grok-still-body.txt`
3. **DUPLICATE** `save_still_url` → `save_still_a`  
   - `reel_still_url_a` = `{{ $json.data[0].url }}`
4. Duplicate still+save for **b / c / d** (use multi-image body with Pep + still A)

**QC:** Pep must match master in all 4. Reroll drifted stills only.

---

## Phase D — 4 videos
For each beat: `prep_pep_video_x` (from `n8n-pep-prep-video-beat.js`, set `BEAT`)  
→ DUP `grok_video_start` → wait → DUP `grok_video_poll` → IF ready.

---

## Phase E — TTS + stitch ~60s
See `marketing/n8n-pep-stitch-notes.md`.

---

## Phase F — `sheets_update_pep`
DUP `sheets_update_creation` → tab `150-pb-pep-scenes`  
(`marketing/n8n-pep-sheets-update.txt`)

Buffer only after Sal approves a master.

---

## Target chain (full)

```text
Manual/Schedule
  → get_rows_in_sheet            # 150-pb-pep-scenes
  → filter_active
  → sort_rotation
  → Limit                        # 1
  → prep_pep_breakdown           # includes pep_ref_url
  → edit_fields_pep_caption
  → GROK_API
  → Parse_Grok
  → if_compliance
       true → prep_pep_beats
              → grok_pep_still_a → save_still_a
              → grok_pep_still_b → save_still_b
              → grok_pep_still_c → save_still_c
              → grok_pep_still_d → save_still_d
              → [video a→d start/wait/poll]
              → tts_pep_voice_over
              → stitch_pep_master
              → save_pep_outputs
              → sheets_update_pep
```

---

## Why Pep stays identical
Stills use **`/v1/images/edits`** with the same master PNG as `<IMAGE_0>` every time — not text-only generation.  
Details: `marketing/n8n-pep-character-lock.md`
