# EXECUTE — `vid_gen_palm_beach_pep` (4 stills · ~60s · VO · locked Pep)

**Status:** BUILD IN PROGRESS — use **EXACT** canvas node names below  
**Length:** ~60s (4× ~15s) + ElevenLabs TTS  
**Sheet:** `150-pb-pep-scenes`  
**Character lock:** `marketing/n8n-pep-character-lock.md`  
**Video stack:** `marketing/n8n-pep-elevenlabs-video.md` (fal OmniHuman talking clip + ElevenLabs TTS; Kling optional walk B-roll)  
**Pep master:** `https://files.catbox.moe/2yfdbi.jpg`

---

## EXACT node names (current canvas — do not rename)

These are the **exact** n8n node names. All `$('…')` expressions and build steps must use them as written (including casing and the `if_complaince` spelling).

Talking path (locked — OmniHuman):

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
                 → prep_pep_lipsync
                 → pep_lipsync_fal
                 → save_lipsync_video_url
                 → sheets_update_creation
```

Kling walk chain still exists — **leave it, do not delete**, keep it **disconnected** from the talking path:

```text
prep_grok_video_start → ai_vid_generator → Wait2 → Wait → grok_video_poll → kling_video_result → save_video_url
```

**Disconnect (do not delete/rename):** `fal_lipsync_call` → `Wait3` → `pep_lipsync_poll` → `pep_lip_sync_result`, and `kling_video_request`.

**Not on canvas / do not invent:** `save_tts_audio_url`, `pep_lipsync_start`, `pep_lipsync_result`. Live Kling POST is **`ai_vid_generator`**. Result GET is **`(kling_video_result)`**. Talking job is **`pep_lipsync_fal`** OmniHuman v1.5.

TTS public URL = `fal_upload_tts_initiate.file_url`.

| # | Exact node name | Function |
|---|---|---|
| — | `Schedule Trigger` | Starts the run |
| 1 | `get_rows_in_sheet` | Read tab `150-pb-pep-scenes` |
| 2 | `filter_active` | Keep Active rows |
| 3 | `sort_rotation` | Sort `times_used` ASC, then `last_used_at` ASC |
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
| 16 | `prep_pep_lipsync` | OmniHuman inputs from `save_still_url.reel_still_url` + `fal_upload_tts_initiate.file_url` |
| 17 | `pep_lipsync_fal` | fal OmniHuman v1.5 — `image_url` + `audio_url` + `resolution` `1080p`. Wait for Completion ON. Max wait `1200` |
| 18 | `save_lipsync_video_url` | Save `lipsync_video_url` from `$json.video.url` · Include Other Input Fields **OFF** |
| 19 | `sheets_update_creation` | Sheet writeback |
| — | `prep_grok_video_start` | Optional Kling walk B-roll — keep disconnected from talking path |
| — | `ai_vid_generator` | Optional Kling POST (`queue.fal.run/.../kling-video/...`) |
| — | `Wait2` | Wait after `ai_vid_generator` |
| — | `Wait` | Wait before `grok_video_poll` |
| — | `grok_video_poll` | Poll Kling job (`status_url`) |
| — | `kling_video_result` | GET Kling `response_url` after COMPLETED |
| — | `save_video_url` | Save silent Kling `video_url` · Include Other Input Fields **OFF** · no `video_url_a` |

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
2. Keep `filter_active` → `sort_rotation` (`times_used` ASC, then `last_used_at` ASC) → `Limit` (=1 unused row)
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
| `times_used` | `{{ $json.times_used }}` |
| `last_used_at` | `{{ $json.last_used_at }}` |
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
4. **QC gate:** still vs master side-by-side. Face / hat logo / crimp / gloves / sneakers must match. Pose must be mid-stride walking (not master thumbs-up). **Mouth OPEN mid-word** (OmniHuman start frame). Drift or planted thumbs-up → reroll. Do not send a thumbs-up still into OmniHuman.

**Then duplicate for 4 stills** (keep original names for A):

| Beat | Still node (exact / new) | Save node |
|---|---|---|
| A | `grok_imagine_reel_still` | `save_still_url` |
| B | `grok_imagine_reel_still_b` | `save_still_url_b` |
| C | `grok_imagine_reel_still_c` | `save_still_url_c` |
| D | `grok_imagine_reel_still_d` | `save_still_url_d` |

---

## Phase D — Talking clip via OmniHuman (exact names first)

**Locked talking model:** ByteDance **OmniHuman v1.5** on fal (`fal-ai/bytedance/omnihuman/v1.5`). Image + audio → talking video. Not Kling. Not sync-3.

**Setup:** `marketing/n8n-pep-lipsync-setup.md`  
**Paste codes:** `marketing/n8n-pep-full-paste-codes.md`

| Exact node | Action |
|---|---|
| `prep_pep_lipsync` | Paste `marketing/n8n-pep-prep-lipsync.js`. Each Item. Outputs `lipsync_image_in` + `lipsync_audio_in` |
| `pep_lipsync_fal` | fal community node · Model **OmniHuman / Omnihuman v1.5** · Image + Audio + Resolution `1080p` + fixed Prompt · Wait for Completion ON · Max Wait `1200` |
| `save_lipsync_video_url` | `lipsync_video_url` `={{ $json.video.url }}` · Include Other Input Fields **OFF** · `model_video` = `fal-omnihuman-v1.5` |

Kling I2V stays on canvas as **optional walk B-roll only**. Do **not** wire it into the talking path. Do **not** wire `kling_video_request`.

**Sheet field (talking clip):** `model_video` = `fal-omnihuman-v1.5`

---

## Saving vs running (cost)

Pasting code into `prep_pep_lipsync` and filling **`pep_lipsync_fal`** parameters is free. **Test workflow / Execute** is what bills Grok stills, OmniHuman, and (if unpinned) Kling.

Do **not** click Test workflow just to save the canvas.

A new still is a Grok Imagine charge. OmniHuman is a separate fal charge. Kling walk B-roll is a third charge only if that chain is unpinned and wired.

---

## What “pin” means in n8n

**Pin** (n8n calls it **Pin data**) = freeze that node’s last result and tell n8n to **reuse it** instead of running the node again.

- Every node has **output**: the data it produced last time (a still URL, a video URL, a `request_id`, etc.).
- If a node is **not pinned**, Test workflow **runs it for real** (API call, new still, new OmniHuman clip, new Kling if that chain is live — that costs money).
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

## Unique scene + unique VO (locked production run)

Each Test workflow must pick a new unused sheet row (`sort_rotation` + `Limit` = 1) and generate a new still, new TTS, and new OmniHuman clip.

**NEVER PIN:** `grok_imagine_reel_still`, `tts_pep_voice_over`, `pep_lipsync_fal`

**UNPIN:** `get_rows_in_sheet`, `filter_active`, `sort_rotation`, `Limit`, `Prep_day_variant`, `grok_api`, `parse_grok`, `if_complaince`, `prep_pep_beats`, `tts_pep_voice_over`, `fal_upload_tts_initiate`, `merge_tts_binary`, `fal_upload_tts_put`, `grok_imagine_reel_still`, `save_still_url`, `prep_pep_lipsync`, `pep_lipsync_fal`, `save_lipsync_video_url`, `sheets_update_creation`

**PIN (skip Kling bill):** `prep_grok_video_start`, `ai_vid_generator`, `Wait2`, `Wait`, `grok_video_poll`, `kling_video_result`, `save_video_url`

Leave disconnected: `fal_lipsync_call`, `Wait3`, `pep_lipsync_poll`, `pep_lip_sync_result`, `kling_video_request`.

Do **not** hardcode Audio Url. `pep_lipsync_fal` `audio_url` stays `={{ $('fal_upload_tts_initiate').item.json.file_url }}`.

Then **Test workflow** once. Wait up to ~1200s.

---

## Reuse existing still + TTS ($0 generate except OmniHuman)

This path **reuses** a scene. Do **not** use it when Sal wants a unique scene.

**NEVER PIN:** `pep_lipsync_fal`

**PIN:** `Schedule Trigger`, `get_rows_in_sheet`, `filter_active`, `sort_rotation`, `Limit`, `Prep_day_variant`, `grok_api`, `parse_grok`, `if_complaince`, `prep_pep_beats`, `tts_pep_voice_over`, `fal_upload_tts_initiate`, `merge_tts_binary`, `fal_upload_tts_put`, `grok_imagine_reel_still`, `save_still_url`, `prep_grok_video_start`, `ai_vid_generator`, `Wait2`, `Wait`, `grok_video_poll`, `kling_video_result`, `save_video_url`

**UNPIN:** `prep_pep_lipsync`, `pep_lipsync_fal`, `save_lipsync_video_url` (and `sheets_update_creation` if you want the sheet updated)

Leave disconnected: `fal_lipsync_call`, `Wait3`, `pep_lipsync_poll`, `pep_lip_sync_result`, `kling_video_request`.

**Step 3 — pin the frozen nodes on the canvas**

After the old run is loaded onto the canvas (Debug in editor, or leftover OUTPUT from the last test):

For every node in the PIN list: click it on the canvas → **OUTPUT** → thumbtack.

| Exact node | OUTPUT must show this before you pin |
|---|---|
| `save_still_url` | `reel_still_url` starting with `https://` (xAI still, not Catbox) |
| `fal_upload_tts_initiate` | `file_url` on fal CDN |
| `prep_pep_lipsync` | `lipsync_image_in` + `lipsync_audio_in` |
| `pep_lipsync_fal` | `video.url` (after a successful OmniHuman run) |
| `save_lipsync_video_url` | `lipsync_video_url` starting with `https://` |

Do **not** click Test workflow after pinning unless you intend a paid run.

---

## When you *choose* to buy one new OmniHuman clip (no new still)

This still **reuses** TTS + still. Do **not** use it for a unique-scene run.

**NEVER PIN:** `pep_lipsync_fal`

**PIN:** `Schedule Trigger`, `get_rows_in_sheet`, `filter_active`, `sort_rotation`, `Limit`, `Prep_day_variant`, `grok_api`, `parse_grok`, `if_complaince`, `prep_pep_beats`, `tts_pep_voice_over`, `fal_upload_tts_initiate`, `merge_tts_binary`, `fal_upload_tts_put`, `grok_imagine_reel_still`, `save_still_url`, `prep_grok_video_start`, `ai_vid_generator`, `Wait2`, `Wait`, `grok_video_poll`, `kling_video_result`, `save_video_url`

**UNPIN:** `prep_pep_lipsync`, `pep_lipsync_fal`, `save_lipsync_video_url`

Then **Test workflow** once. That is one OmniHuman job, not a new still and not a Kling job.

Do **not** pin `pep_lipsync_fal` on that run or n8n will replay the old clip with no new charge and no new mouth.

---

## Phase E — ElevenLabs TTS + OmniHuman (same workflow)
TTS and OmniHuman already sit on this canvas. Do not split them out.  
See `marketing/n8n-pep-stitch-notes.md` and `marketing/n8n-pep-lipsync-setup.md`.  
A→B→C→D concat (~60s) waits until Beat A OmniHuman looks right.

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
$('grok_api')
$('parse_grok')
$('if_complaince')
$('prep_pep_beats')
$('tts_pep_voice_over')
$('fal_upload_tts_initiate')
$('merge_tts_binary')
$('fal_upload_tts_put')
$('grok_imagine_reel_still')
$('save_still_url')
$('prep_pep_lipsync')
$('pep_lipsync_fal')
$('save_lipsync_video_url')
$('sheets_update_creation')
$('prep_grok_video_start')
$('ai_vid_generator')
$('grok_video_poll')
$('kling_video_result')
$('save_video_url')
```

---

## Support files
| File | Use |
|---|---|
| `marketing/n8n-pep-elevenlabs-video.md` | ElevenLabs TTS + OmniHuman talking clip (Kling optional B-roll) |
| `marketing/n8n-pep-prep-beats.js` | Code for `prep_pep_beats` |
| `marketing/n8n-pep-grok-still-body.txt` | Body for `grok_imagine_reel_still` (+ _b/_c/_d) |
| `marketing/n8n-pep-prep-video-beat.js` | Template for fal Kling video prep (set BEAT) |
| `marketing/n8n-pep-save-outputs.txt` | Optional expanded save fields |
| `marketing/n8n-pep-sheets-update.txt` | `sheets_update_creation` mapping |
| `marketing/n8n-pep-lipsync-setup.md` | OmniHuman talking clip — full `pep_lipsync_fal` params |
| `marketing/n8n-pep-omnihuman-keeper.txt` | Locked keeper clip / open-mouth still / wav local copies |
| `marketing/n8n-pep-stitch-notes.md` | ElevenLabs TTS + stitch |
| `marketing/n8n-pep-character-lock.md` | Master likeness rules |
