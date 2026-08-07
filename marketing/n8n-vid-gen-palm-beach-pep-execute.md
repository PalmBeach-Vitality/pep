# EXECUTE — `vid_gen_palm_beach_pep` (4 stills · ~60s · VO)

**Status:** Ready to build in n8n  
**Target:** ~60s Pep breakdown (4× ~15s beats) + TTS voiceover  
**Sheet:** `150-pb-pep-scenes`  
**CSV:** `marketing/sheets/150-pb-pep-scenes.csv`

**Method:** Duplicate your current landscape video workflow / nodes. Do **not** edit the live landscape workflow.

---

## 0) Start — duplicate workflow

1. Open current workflow (the one in your screenshot).
2. **⋯ → Duplicate**
3. Rename copy → **`vid_gen_palm_beach_pep`**
4. Disable Schedule on the copy until Phase F smoke passes (use Manual Trigger for builds).

---

## 1) Critical fix vs current sequence

Your current canvas has **two sheet pulls**:
- top: `get_rows_in_sheet` → captions
- bottom: `get_reel_creations` → still/video

That can pick **two different rows**. For Pep:

**Delete / disconnect** `get_reel_creations` → `filter_creations_active` → `pick_creation`.

Lock **one row** from:

`get_rows_in_sheet` → `filter_active` → `sort_rotation` → `Limit(1)`

All stills + videos + captions must use that same `creation_id`.

---

## 2) Target chain (exact names)

```text
Schedule Trigger                         # keep, disabled until ready
  → get_rows_in_sheet                    # RETARGET tab 150-pb-pep-scenes
  → filter_active                        # status = Active
  → sort_rotation                        # last_used_at ASC, times_used ASC, rank ASC
  → Limit                                # 1
  → prep_pep_breakdown                   # was Prep_day_variant (rename + rewire)
  → edit_fields_pep_caption              # was Edit Fields1
  → GROK_API                             # keep / duplicate
  → Parse_Grok                           # keep / adapt parse fields
  → if_compliance                        # keep (fix typo if_complaince → if_compliance)
       false → stop
       true  → prep_pep_beats            # NEW Code
                 → grok_pep_still_a      # DUP grok_imagine_reel_still
                 → save_still_a
                 → grok_pep_still_b
                 → save_still_b
                 → grok_pep_still_c
                 → save_still_c
                 → grok_pep_still_d
                 → save_still_d
                 → prep_pep_video_a      # NEW Code
                 → grok_video_start_a    # DUP grok_video_start
                 → wait_beat_a           # NEW Wait (or reuse wait pattern)
                 → grok_video_poll_a     # DUP grok_video_poll
                 → if_beat_a_ready
                 → prep_pep_video_b
                 → grok_video_start_b
                 → wait_beat_b
                 → grok_video_poll_b
                 → if_beat_b_ready
                 → prep_pep_video_c
                 → grok_video_start_c
                 → wait_beat_c
                 → grok_video_poll_c
                 → if_beat_c_ready
                 → prep_pep_video_d
                 → grok_video_start_d
                 → wait_beat_d
                 → grok_video_poll_d
                 → if_beat_d_ready
                 → tts_pep_voice_over    # NEW
                 → stitch_pep_master     # NEW
                 → save_pep_outputs      # DUP save_video_url / save_still_url pattern
                 → sheets_update_pep     # DUP sheets_update_creation → Pep tab
```

Buffer nodes: add **after** Sal approves a master cut (`buffer_pep_ig` / `buffer_pep_fb`).

---

## 3) What “4 Pep stills” means here

| Still | Beat | ~Time | Job |
|---|---|---|---|
| A | Hook | 0–15s | Pep in scene, hello energy |
| B | Product | 15–30s | Label / product clarity |
| C | World | 30–45s | Environment moment (lab / fitness / landscape) |
| D | Close | 45–60s | Thumbs-up + CTA / disclaimer hold |

Each still → one `grok-imagine-video-1.5` clip (~15s) → stitch + VO = **~60s**.

---

## 4) Build steps (do in order)

### Phase A — Sheet pick (edit duplicated nodes)

| Node | Action |
|---|---|
| `get_rows_in_sheet` | Point Document/Sheet to **`150-pb-pep-scenes`** (exact tab Sal imports) |
| `filter_active` | Keep `status = Active` |
| `sort_rotation` | Same rotation sort as landscape |
| `Limit` | Max items = **1** |

**Smoke A:** Manual run → one `creation_id` like `PEP-001`.

### Phase B — Prep + captions

| Node | Action |
|---|---|
| `prep_pep_breakdown` | Rename `Prep_day_variant`. Map Limit fields: `creation_id`, `compound_*`, `canonical_url`, `caption_lock`, `scene_brief`, `surface`, `lighting`, `camera_move`, `hero_style`, `voice_over`, `pep_script`, `disclaimer_short`, `video_prompt`, `video_motion_prompt` |
| `edit_fields_pep_caption` | Rename `Edit Fields1`. Build system/user prompts; force `caption_lock` + disclaimer |
| `GROK_API` | Keep model `grok-4.5` (fallback `grok-4.3`) |
| `Parse_Grok` | Parse captions JSON; expose `compliance_ok`, `ig_caption_draft`, `fb_caption_draft`, `display_name` |
| `if_compliance` | true continues; false stops |

**Smoke B:** Captions mention only locked compound + research-use closer.

### Phase C — 4 stills

1. **DUPLICATE** `grok_imagine_reel_still` → `grok_pep_still_a`  
2. Paste body from `marketing/n8n-pep-grok-still-body.txt` (beat `a`)  
3. **DUPLICATE** → `grok_pep_still_b` / `_c` / `_d` (change beat letter in body)  
4. After each still: **DUPLICATE** `save_still_url` → `save_still_a`…`save_still_d`  
   - Field: `reel_still_url_a` = `{{ $json.data[0].url }}` (etc.)

Wire: `prep_pep_beats` → still_a → save_a → still_b → save_b → still_c → save_c → still_d → save_d

**Code for beats:** `marketing/n8n-pep-prep-beats.js` → node `prep_pep_beats`

**Smoke C:** 4 image URLs; Pep recognizable in all.

### Phase D — 4 videos

For beat **a** (then duplicate pattern for b/c/d):

| Node | How |
|---|---|
| `prep_pep_video_a` | Code from `marketing/n8n-pep-prep-video-beat.js` (set `BEAT = 'a'`) |
| `grok_video_start_a` | **DUPLICATE** `grok_video_start` · body = `{{ $json.video_request_body_string }}` or JSON from prep |
| `wait_beat_a` | Wait 20–30s |
| `grok_video_poll_a` | **DUPLICATE** `grok_video_poll` · GET `/v1/videos/{{request_id}}` |
| `if_beat_a_ready` | `status = done` → continue; `pending` → loop wait; fail → stop |

Repeat for b/c/d using still URLs from `save_still_*`.

**Smoke D:** four ~15s clips; Pep identity holds.

### Phase E — TTS + stitch (~60s master)

| Node | Notes |
|---|---|
| `tts_pep_voice_over` | HTTP to ElevenLabs or OpenAI TTS using `voice_over` from `prep_pep_breakdown` / Limit |
| `stitch_pep_master` | Concat beat videos A→D + mux TTS (ffmpeg Execute Command **or** merge API). Spec: `marketing/n8n-pep-stitch-notes.md` |
| `save_pep_outputs` | Collect `final_video_url`, four beat URLs, still A URL, captions, `creation_id` |

**Smoke E:** ~55–65s master; VO ends with exact disclaimer.

### Phase F — Writeback (+ Buffer later)

| Node | Action |
|---|---|
| `sheets_update_pep` | **DUPLICATE** `sheets_update_creation` · tab **`150-pb-pep-scenes`** · match `creation_id` · update `last_used_at`, `times_used`, `reel_still_url`, `video_url` |
| Buffer | Add only after Sal approves master |

---

## 5) File pack (this repo)

| File | Use |
|---|---|
| `marketing/n8n-pep-prep-beats.js` | Code node `prep_pep_beats` |
| `marketing/n8n-pep-prep-video-beat.js` | Code nodes `prep_pep_video_a`…`d` |
| `marketing/n8n-pep-grok-still-body.txt` | Imagine HTTP body (swap beat letter) |
| `marketing/n8n-pep-save-outputs.txt` | `save_pep_outputs` fields |
| `marketing/n8n-pep-sheets-update.txt` | `sheets_update_pep` mapping |
| `marketing/n8n-pep-stitch-notes.md` | Stitch/TTS options |

---

## 6) Smoke checklist

- [ ] Workflow name is `vid_gen_palm_beach_pep` (landscape untouched)
- [ ] Only **one** sheet pick (no `get_reel_creations`)
- [ ] Tab = `150-pb-pep-scenes`
- [ ] 4 stills generate
- [ ] 4 videos generate (~15s each)
- [ ] TTS + stitch ≈ 60s
- [ ] Disclaimer exact at end of VO
- [ ] Sheet writeback advances rotation

---

## 7) Sal decisions still open (defaults used)

| Item | Default for this execute pack |
|---|---|
| Length | **~60s** (4×15) |
| TTS | OpenAI `tts-1` **or** ElevenLabs — wire whichever credential Sal has |
| Stitch | Prefer **ffmpeg** on n8n host; fallback documented |
| Buffer | **Off** until master approved |
| Human gate | Manual Trigger through Phase E first week |
