# One 50s talking clip — nodes Sal must add or change

1080p audio cap is **30s**. This pitch is **~50–60s**, so `pep_lipsync_fal` Resolution must be **720p**. **One talking clip.** Standing Pep, sheet `voice_over`, lipsync, normal eyes. No extra scene cuts.

Leave `(loop_pep_beats)` on the canvas. Split now emits **1 item**, so the loop runs once and then `done`.

Do **not** Test workflow until you are ready to smoke. Saving params is free.

## Wire

Keep the loop. Do not delete it. Do not add `_b/_c/_d` nodes.

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

OUTPUT must show `beat_items` (length **1**), `beat_count` **1**, standing pose, and `tts_text` = sheet pitch. Last sentence: `Visit us at palmbeach-vitality.store.` No FDA / unique-set / laboratory-research-use-only.

---

## 2. PASTE `(split_pep_beats)`

`prep_pep_beats` → **`(split_pep_beats)`** → **`(loop_pep_beats)`**

| Parameter | Value |
|---|---|
| Node type | Code |
| Exact name | `split_pep_beats` |
| Mode | **Run Once for All Items** |
| Language | JavaScript |

Paste `marketing/n8n-pep-split-beats.js`.

OUTPUT = **1 item**. `beat` = `a`. Full pitch in `tts_text`. Standing `pose_still`.

---

## 2b. KEEP `(loop_pep_beats)`

Leave it. Batch Size **1**. Reset **OFF**.

**loop** → `tts_pep_voice_over` → … → `save_lipsync_video_url` → **back into** `loop_pep_beats`

**done** → **`(gather_pep_clips)`** → `sheets_update_creation`

With 1 item the loop fires once, then done. You will not see badges `1` `2` `3` `4`.

---

## 3. CHANGE `tts_pep_voice_over` JSON Body only

JSON Body fx **ON**. Delete any `{ "text": ... }` first. Paste `marketing/n8n-pep-tts-body.txt` as the **entire** field (`={{ JSON.stringify({` … `}) }}`). Do **not** wrap it in another `{ }`. Preview must be one JSON object whose `text` is the pitch.

Request preview: intro + product + studies line + `Visit us at palmbeach-vitality.store.` ~146 words. Easy, upbeat, wellness. `text` is `tts_speak` (pronunciation map). Semaglutide must read as `SEM-uh-GLOO-tide`.

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

Paired `$('tts_pep_voice_over').item`.

---

## 6. PASTE `grok_imagine_reel_still` JSON Body

JSON Body fx **ON**. Paste `marketing/n8n-pep-grok-still-body-lock.txt` (the `={{ JSON.stringify({` block only).

POSE reads `$('split_pep_beats').item.json.pose_still` (standing). SET uses that row’s `surface`.

QC the still before OmniHuman: eyes match master (same lash state from frame one; master currently has none), label type is exactly `10ml` (discard `10mlz`). If the still is good, do **not** remint `grok_imagine_reel_still`. Eye morph / **lash grow-in after the first blink** in the mp4 are an OmniHuman miss — remint `pep_lipsync_fal` only. Lashes are OK if they exist from 1s or are absent the whole clip. Blinks and glances in the video are good.

---

## 7. PASTE `prep_pep_lipsync`

Mode: **Run Once for Each Item**. Replace the JS with `marketing/n8n-pep-prep-lipsync.js`.

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

## 9. PASTE `(gather_pep_clips)`

`loop_pep_beats` (**done**) → **`(gather_pep_clips)`** → `sheets_update_creation`

| Parameter | Value |
|---|---|
| Node type | Code |
| Exact name | `gather_pep_clips` |
| Mode | **Run Once for All Items** |
| Language | JavaScript |

**Select all** in the JavaScript field, **delete**, then paste `marketing/n8n-pep-gather-clips.js`. Do not paste under old gather JS. First line must be `// Node: gather_pep_clips (Code)`. Mode **Run Once for All Items**.

OUTPUT (one item): `video_url` and `lipsync_video_url` = the one talking clip.

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

---

## 11. CHANGE `pep_lipsync_fal` Resolution to `720p`

1080p audio max is **30s**. This VO is **~50–60s**. Resolution **must** be **720p** or fal 422s.

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

## After the URLs exist

This is **one** talking mp4. Audio is already in the file. No concat. No extra VO track.

---

## When you smoke later

**UNPIN:** `split_pep_beats`, `gather_pep_clips`, plus the usual talking-path nodes.

**NEVER PIN:** `grok_imagine_reel_still`, `tts_pep_voice_over`, `pep_lipsync_fal`

One Test workflow = 1 still + 1 TTS + 1 OmniHuman **720p**. QC still first: same lash state as master from frame one, type exactly `10ml`.
