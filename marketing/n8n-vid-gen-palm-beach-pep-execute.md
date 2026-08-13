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
                 → grok_imagine_reel_still
                 → save_still_url
                 → prep_grok_video_start
                 → ai_vid_generator
                 → Wait2
                 → Wait
                 → grok_video_poll
                 → kling_video_result
                 → save_video_url
                 → prep_pep_lipsync
                 → fal_lipsync_call
                 → Wait3
                 → pep_lipsync_poll
                 → pep_lip_sync_result
                 → save_lipsync_video_url
                 → sheets_update_creation
```

**Not on canvas:** `save_tts_audio_url`, `kling_video_request`, `kling_video_result`, `pep_lipsync_start`, `pep_lipsync_result`. Do not use those names.

TTS public URL = `fal_upload_tts_initiate.file_url`.

| # | Exact node name | Function |
|---|---|---|
| — | `Schedule Trigger` | Starts the run |
| 1 | `get_rows_in_sheet` | Read tab `150-pb-pep-scenes` |
| 2 | `filter_active` | Keep Active rows |
| 3 | `sort_rotation` | Rotation sort |
| 4 | `Limit` | One row only |
| 5 | `Prep_day_variant` | Map row fields + `pep_ref_url` |
| 6 | `grok_api` | Caption LLM (`POST /v1/chat/completions`) |
| 7 | `parse_grok` | Parse caption JSON |
| 8 | `if_complaince` | Compliance gate (`complaince` spelling is on purpose) |
| 9 | `prep_pep_beats` | Beat briefs + `vo_beat_a` |
| 10 | `tts_pep_voice_over` | ElevenLabs TTS binary MP3 |
| 11 | `fal_upload_tts_initiate` | fal upload initiate → `file_url` + `upload_url` |
| 12 | `merge_tts_binary` | Attach TTS binary onto initiate item |
| 13 | `fal_upload_tts_put` | PUT binary `data` to `upload_url` |
| 14 | `grok_imagine_reel_still` | Pep still — URL must be `/v1/images/edits` + master, not `/generations` |
| 15 | `save_still_url` | Save `reel_still_url` |
| 16 | `prep_grok_video_start` | Build I2V JSON body |
| 17 | `ai_vid_generator` | Video HTTP after prep (fal Kling queue — confirm URL is `queue.fal.run/.../kling-video/...`) |
| 18 | `Wait2` | Wait after `ai_vid_generator` |
| 19 | `Wait` | Wait before `grok_video_poll` |
| 20 | `grok_video_poll` | Poll video job (`status_url`) |
| 21 | `kling_video_result` | GET `response_url` after COMPLETED — this is where `video.url` lives |
| 22 | `save_video_url` | Save silent `video_url` from `$json.video.url` · Include Other Input Fields **OFF** · no `video_url_a` |
| 23 | `prep_pep_lipsync` | Lipsync body from `save_video_url` + `fal_upload_tts_initiate.file_url` |
| 24 | `fal_lipsync_call` | POST fal `sync-lipsync/v3` |
| 25 | `Wait3` | Wait before lipsync poll |
| 26 | `pep_lipsync_poll` | GET lipsync `/status` |
| 27 | `pep_lip_sync_result` | GET lipsync result |
| 28 | `save_lipsync_video_url` | Save `lipsync_video_url` |
| 29 | `sheets_update_creation` | Sheet writeback |

**Hard rule:** Do not rename these nodes.

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
4. **QC gate:** still vs master side-by-side. Face / hat logo / crimp / gloves / sneakers must match. Pose must be mid-stride walking (not master thumbs-up). Drift or planted thumbs-up → reroll. Do not send a thumbs-up still into `ai_vid_generator`.

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

## Saving vs running (cost)

Pasting code into `prep_grok_video_start` and filling **`kling_video_request`** parameters is free. **Test workflow / Execute** is what bills Grok stills, Kling video, and fal lipsync.

Do **not** click Test workflow just to save the canvas.

Approx (audio off): Kling 15s ≈ **$1.68**. A new still is a separate Grok Imagine charge. fal lipsync is a third charge.

---

## What “pin” means in n8n

**Pin** (n8n calls it **Pin data**) = freeze that node’s last result and tell n8n to **reuse it** instead of running the node again.

- Every node has **output**: the data it produced last time (a still URL, a video URL, a `request_id`, etc.).
- If a node is **not pinned**, Test workflow **runs it for real** (API call, new still, new Kling clip, new lipsync — that costs money).
- If a node **is pinned**, Test workflow **skips the API call** and hands the frozen output to the next node. No new image, no new video, no new fal job.

It is a thumbtack on that node’s **OUTPUT** in the **workflow editor** (the canvas). You cannot pin inside the **Executions** history list — that screen is read-only.

**You will know it worked when:** the node on the canvas shows a small pin/thumbtack badge, and the OUTPUT panel still shows the same URL/JSON from the old run.

**Unpin** = click the thumbtack again. That removes the freeze. The next Test workflow will run the node for real again and bill if it is a generate node.

Pin does **not** save the workflow by itself. Pin only controls whether a node is skipped on the next run.

---

## Where to pin (not in Executions)

Do this on the **canvas** (the screen with all the nodes wired together).

1. Open the workflow editor (not the Executions list).
2. Click a node on the canvas.
3. Open **OUTPUT** on the right.
4. If you see JSON/URLs → click the **thumbtack** at the top of OUTPUT (or right-click the node → **Pin data**).
5. If OUTPUT says **No output data**, the canvas does not have that run loaded yet. You cannot pin air.

**To load an old run onto the canvas** (then pin in the editor):

1. Stay in this workflow.
2. Open **Executions** for this workflow.
3. Click the successful run (the one that already has still + video + lipsync URLs).
4. Click **Debug in editor** (wording may be **Copy to editor** or a three-dot menu → **Debug**). That dumps that run’s outputs onto the canvas. It does not re-run anything and does not cost money.
5. You are now back on the canvas. Click each node → OUTPUT → thumbtack.

If there is **no Debug in editor / Copy to editor** button: you can only pin nodes that already show OUTPUT from the last time you tested while this tab was open. You cannot pin from the Executions page itself.

If the canvas has no OUTPUT on the nodes and you cannot debug-in-editor: **do not Test workflow**. Just paste/save node parameters. Saving is free and does not need pin.

---

## Reuse existing still + video ($0 generate)

n8n cannot execute a mid-chain node alone. To run the workflow **without** a new image or video, **pin every generate node** from a previous good execution, then Test workflow only if you need a free downstream step (e.g. sheets).

**PIN (do not regenerate — $0):**

- `grok_imagine_reel_still`
- `save_still_url`
- `prep_grok_video_start`
- `kling_video_request`
- Kling `Wait`
- `grok_video_poll`
- `kling_video_result`
- `save_video_url`
- plus sheet/TTS nodes if you also do not want those to rerun: `get_rows_in_sheet` through `save_tts_audio_url`

**Also PIN if you do not want another lipsync bill:**

- `prep_pep_lipsync`
- `pep_lipsync_start` (or `fal_lipsync_call` if that is the name on canvas)
- the **lipsync** `Wait` (the Wait after the lipsync submit, before `pep_lipsync_poll`)
- `pep_lipsync_poll`
- `pep_lipsync_result` (or `pep_lip_sync_result` if that is the name on canvas)
- `save_lipsync_video_url`

**Step 3 — pin the lipsync nodes on the canvas**

After the old run is loaded onto the canvas (Debug in editor, or leftover OUTPUT from the last test):

For every node in the list: click it on the canvas → **OUTPUT** → thumbtack.

| Exact node | OUTPUT must show this before you pin |
|---|---|
| `prep_pep_lipsync` | `lipsync_request_body` with `video_url` + `audio_url` |
| `pep_lipsync_start` (or `fal_lipsync_call`) | `request_id`, `status_url`, `response_url` |
| lipsync `Wait` | items passed through after the wait |
| `pep_lipsync_poll` | `status`: `COMPLETED` |
| `pep_lipsync_result` (or `pep_lip_sync_result`) | `video.url` |
| `save_lipsync_video_url` | `lipsync_video_url` starting with `https://` |

Do **not** click Test workflow after pinning unless you intend a paid run.

---

## When you *choose* to buy one new Kling clip (no new still)

**PIN:** `grok_imagine_reel_still`, `save_still_url`, and the TTS chain (`tts_pep_voice_over` through `save_tts_audio_url`).

**UNPIN:** `prep_grok_video_start`, `kling_video_request`, Kling `Wait`, `grok_video_poll`, `kling_video_result`, `save_video_url`, then the lipsync chain if you want VO on the new clip.

Then **Test workflow** once. That is one 15s Kling job, not a new still.

Do **not** pin `kling_video_request` on that run or n8n will replay the old clip with no new charge and no new motion.

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
