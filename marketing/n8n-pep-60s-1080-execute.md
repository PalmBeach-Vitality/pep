# 60s 1080p stitch — nodes Sal must add or change

1080p audio cap is **30s**. This pitch is **55–60s**, so `pep_lipsync_fal` Resolution must be **720p**. **4 scene cuts**, unique pose each, **same easy wellness pitch** on all 4. Intro + product + studies line + `Visit us at palmbeach-vitality.store.` No compliance.

Do **not** duplicate `_b/_c/_d` still/TTS/OmniHuman nodes. `(split_pep_beats)` + `(loop_pep_beats)` run the talking chain **one beat at a time** (fal max 3 concurrent).

Do **not** Test workflow until you are ready to smoke. Saving params is free.

## Wire

fal max concurrent = **3**. Two beats in parallel can still 429 if anything else is running. Keep **`(loop_pep_beats)`** Batch Size **1**.

```text
if_complaince (true)
  → prep_pep_beats
  → (split_pep_beats)
  → (loop_pep_beats)          Batch Size 1
       loop → tts_pep_voice_over
            → fal_upload_tts_initiate
            → merge_tts_binary
            → fal_upload_tts_put
            → grok_imagine_reel_still
            → save_still_url
            → prep_pep_lipsync
            → pep_lipsync_fal
            → save_lipsync_video_url
            → back to (loop_pep_beats)
       done → (gather_pep_clips)
            → sheets_update_creation
```

`pep_lipsync_fal` stays **720p**. Leave Kling disconnected.

---

## 1. PASTE `prep_pep_beats`

Mode: **Run Once for Each Item**. Replace the JS with `marketing/n8n-pep-prep-beats.js`.

OUTPUT must show `beat_items` (length **4**), four different `pep_body_action_a`…`_d`, and the **same** `tts_text` on every beat. Last sentence: `Visit us at palmbeach-vitality.store.` No FDA / unique-set / laboratory-research-use-only.

---

## 2. ADD `(split_pep_beats)`

`prep_pep_beats` → **`(split_pep_beats)`** → **`(loop_pep_beats)`**

| Parameter | Value |
|---|---|
| Node type | Code |
| Exact name | `split_pep_beats` |
| Mode | **Run Once for All Items** |
| Language | JavaScript |

Paste `marketing/n8n-pep-split-beats.js`.

OUTPUT = **4 items**. Each item has `beat` (`a`/`b`/`c`/`d`), the **same** `tts_text` (product pitch + store CTA), unique `pose_still`, unique `omnihuman_prompt`.

---

## 2b. ADD `(loop_pep_beats)` (required — fal 3-concurrent cap)

Search node: **Loop Over Items** (also listed as Split In Batches).

`split_pep_beats` → **`(loop_pep_beats)`**

| Parameter | fx | Value |
|---|---|---|
| Node type | — | Loop Over Items (Split In Batches) |
| Exact name | — | `loop_pep_beats` |
| Batch Size | OFF | `1` |
| Options → Reset | — | **OFF** |

Two outputs on this node: **loop** and **done**.

**loop** → `tts_pep_voice_over` → … → `save_lipsync_video_url` → **back into** `loop_pep_beats`

**done** → **`(gather_pep_clips)`** → `sheets_update_creation`

Disconnect `split_pep_beats` → `tts_pep_voice_over` (that link is replaced by loop).  
Disconnect `save_lipsync_video_url` → `gather_pep_clips` (gather hangs off **done**, not off save).

Do **not** Test until this loop is in. Parallel OmniHuman/fal jobs will 429.

---

## 3. CHANGE `tts_pep_voice_over` JSON Body only

JSON Body fx **ON**. Delete any `{ "text": ... }` first. Paste `marketing/n8n-pep-tts-body.txt` as the **entire** field (`={{ JSON.stringify({` … `}) }}`). Do **not** wrap it in another `{ }`. Preview must be one JSON object whose `text` is the pitch.

Request preview: intro + product + studies line + `Visit us at palmbeach-vitality.store.` Same words on items 0–3. ~146 words. Easy, upbeat, wellness.

---

## 4. CHANGE `fal_upload_tts_initiate` `file_name` only

JSON Body:

```json
{
  "content_type": "audio/mpeg",
  "file_name": "={{ 'pep-' + String($('split_pep_beats').item.json.creation_id || $('prep_pep_beats').item.json.creation_id || 'run') + '-' + String($('split_pep_beats').item.json.beat || 'a') + '-' + String($now.toMillis()) + '.mp3' }}"
}
```

---

## 5. PASTE `merge_tts_binary`

Mode: **Run Once for Each Item**. Replace the JS with `marketing/n8n-pep-merge-tts-binary.js`.

Paired `$('tts_pep_voice_over').item` for this beat. Do **not** zip `.all()` — the loop makes `.all()` grow.

---

## 6. PASTE `grok_imagine_reel_still` JSON Body

JSON Body fx **ON**. Paste `marketing/n8n-pep-grok-still-body-lock.txt` (the `={{ JSON.stringify({` block only).

POSE now reads `$('split_pep_beats').item.json.pose_still` so each beat gets a different body/gesture. SET still uses that row’s `surface`.

---

## 7. PASTE `prep_pep_lipsync`

Mode: **Run Once for Each Item**. Replace the JS with `marketing/n8n-pep-prep-lipsync.js`.

OUTPUT `beat` must be `a` then `b`. `omnihuman_prompt` must match that beat’s pose, not Beat A for both.

---

## 8. CHANGE `save_lipsync_video_url` `beat` only

Include Other Input Fields stays **OFF**.

| Field Name | Field Type | fx | Value |
|---|---|---|---|
| `lipsync_video_url` | String | ON | `={{ $json.video.url }}` |
| `video_url` | String | ON | `={{ $json.video.url }}` |
| `tts_audio_url` | String | ON | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| `creation_id` | String | ON | `={{ $('split_pep_beats').item.json.creation_id \|\| $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | String | ON | `={{ $('split_pep_beats').item.json.beat }}` |
| `reel_still_url` | String | ON | `={{ $('save_still_url').item.json.reel_still_url }}` |
| `model_video` | String | OFF | `fal-omnihuman-v1.5` |

---

## 9. ADD `(gather_pep_clips)`

`loop_pep_beats` (**done**) → **`(gather_pep_clips)`** → `sheets_update_creation`

| Parameter | Value |
|---|---|
| Node type | Code |
| Exact name | `gather_pep_clips` |
| Mode | **Run Once for All Items** |
| Language | JavaScript |

Paste `marketing/n8n-pep-gather-clips.js`.

Reads every loop run via `$('save_lipsync_video_url').all(0, runIndex)`. A plain `.all()` is only the last scene.

OUTPUT (one item): `lipsync_video_url_a`…`_d` plus `stitch_clip_urls`. Four separate scenes, same pitch. Sheet still has one `video_url` column (scene A).

---

## 10. CHANGE `sheets_update_creation` wire + match/URL fields

Wire: `loop_pep_beats` (**done**) → `gather_pep_clips` → `sheets_update_creation`

| Parameter | fx | Value |
|---|---|---|
| Sheet | OFF | `150-pb-pep-scenes` |
| Column to Match On | OFF | `creation_id` |
| Value to Match On | ON | `={{ $('gather_pep_clips').item.json.creation_id \|\| $('prep_pep_beats').item.json.creation_id \|\| $('Limit').item.json.creation_id }}` |

| Column | Type | fx | Value |
|---|---|---|---|
| `last_used_at` | String | ON | `={{ $now.toISO() }}` |
| `times_used` | Number | ON | `={{ Number($('Limit').item.json.times_used \|\| $('Prep_day_variant').item.json.times_used \|\| 0) + 1 }}` |
| `reel_still_url` | String | ON | `={{ $('gather_pep_clips').item.json.reel_still_url }}` |
| `video_url` | String | ON | `={{ $('gather_pep_clips').item.json.video_url }}` |
| `model_video` | String | ON | `={{ $('gather_pep_clips').item.json.model_video \|\| 'fal-omnihuman-v1.5' }}` |

Do **not** add sheet columns. Copy scene B from `gather_pep_clips` OUTPUT if you need it. Do **not** blend A+B into one 60s film.

---

## 11. CHANGE `pep_lipsync_fal` Resolution to `720p`

1080p audio max is **30s**. This VO is **55–60s**. Resolution **must** be **720p** or fal 422s.

| # | Parameter Name or ID dropdown (fx OFF) | Value fx | Value |
|---|---|---|---|
| 1 | **Image [string]** (`image_url`) | ON | `={{ $('save_still_url').item.json.reel_still_url }}` |
| 2 | **Audio [string]** (`audio_url`) | ON | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| 3 | **Resolution** (`resolution`) | OFF | `720p` |
| 4 | **Prompt [string]** (`prompt`) | **ON** | `={{ String($('prep_pep_lipsync').item.json.omnihuman_prompt) }}` |

| Parameter | fx | Value |
|---|---|---|
| Node type | — | fal.ai |
| Exact name | — | `pep_lipsync_fal` |
| Credential | — | fal.ai account |
| Resource | — | Model |
| Operation | — | Generate Media |
| Model | — | From list · **OmniHuman** / **Omnihuman v1.5** (`fal-ai/bytedance/omnihuman/v1.5`) |
| Wait for Completion | — | **ON** |
| Poll Interval (Seconds) | — | `5` |
| Max Wait Time (Seconds) | — | `1200` |

Do **not** add a fifth parameter. Prompt Value must be a **string**.

`(get_blocking_pool)` stays a dead-end side branch.

---

## After the two URLs exist

These are **four different scene cuts**, not one smooth 60s clip. Same pitch on all four. Do **not** CapCut-morph them into one film.

If you concat later: **hard cut**. No extra VO track — audio is already in each mp4.

---

## When you smoke later

**UNPIN:** `split_pep_beats`, `gather_pep_clips`, plus the usual talking-path nodes.

**NEVER PIN:** `grok_imagine_reel_still`, `tts_pep_voice_over`, `pep_lipsync_fal`

One Test workflow = 4 stills + 4 TTS + 4 OmniHuman **720p**. Loop runs 5 times (A, B, C, D, then done). Budget a long wait (four × up to 1200s). Every clip must speak the same easy wellness pitch (~146 words, 55–60s).
