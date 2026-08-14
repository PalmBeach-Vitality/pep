# 60s 1080p stitch — nodes Sal must add or change

1080p audio cap is **under 30s**. Full sheet `voice_over` is ~60s, so this is **4 × ~15s OmniHuman clips** with a **new pose each beat** (no 60s drift), then CapCut.

Do **not** duplicate `_b/_c/_d` still/TTS/OmniHuman nodes. `(split_pep_beats)` + `(loop_pep_beats)` run the talking chain **one beat at a time** (fal max 3 concurrent).

Do **not** Test workflow until you are ready to smoke. Saving params is free.

## Wire

fal max concurrent = **3**. Four beats in parallel will 429. Run them **one at a time**.

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

`pep_lipsync_fal` stays **1080p**. Leave Kling disconnected.

---

## 1. PASTE `prep_pep_beats`

Mode: **Run Once for Each Item**. Replace the JS with `marketing/n8n-pep-prep-beats.js`.

OUTPUT must show `beat_items` (length 4) and four different `pep_body_action_a`…`_d`.

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

OUTPUT = **4 items**. Each item has `beat` (`a`/`b`/`c`/`d`), `tts_text`, `pose_still`, `omnihuman_prompt`.

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

Do **not** Test until this loop is in. Four parallel OmniHuman/fal jobs will 429 again.

---

## 3. CHANGE `tts_pep_voice_over` JSON Body only

JSON Body fx **ON**. Paste this whole block (starts with `={{`). Do **not** keep `$('prep_pep_beats').item.json.tts_text` — that is Beat A four times.

```
={{ (() => {
  const text = String(
    $json.tts_text ||
    $('split_pep_beats').item.json.tts_text ||
    ''
  ).trim();
  if (!text) {
    throw new Error('Missing beat tts_text. Check split_pep_beats OUTPUT.');
  }
  if (text.includes("$('") || text.includes('={{')) {
    throw new Error('TTS text is an n8n expression, not the sheet VO. JSON Body fx must be ON, paste starting with ={{');
  }
  return JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.45, similarity_boost: 0.8 }
  });
})() }}
```

Request preview (item 0) should be Beat A sheet words. Items 1–3 are B/C/D.

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

OUTPUT `beat` must be `a` then `b` then `c` then `d`. `omnihuman_prompt` must match that beat’s pose, not Beat A for all four.

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

OUTPUT (one item): `lipsync_video_url_a`…`_d` plus `stitch_clip_urls`. That is the CapCut source. Sheet still has one `video_url` column (Beat A).

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

Do **not** add sheet columns. Copy B/C/D URLs from `gather_pep_clips` OUTPUT when you stitch.

---

## Leave alone

`pep_lipsync_fal` — still 1080p, Max Wait `1200`, Image/Audio/Prompt as they are. Four paired items reuse the same node.

`(get_blocking_pool)` stays a dead-end side branch.

---

## CapCut (after the four URLs exist)

1. Timeline: OmniHuman A, B, C, D (9:16).
2. Joins A→B, B→C, C→D: **Cross Dissolve / Film Dissolve**, **8–12 frames**. Not fade-to-black.
3. Optional short fade in on A, fade out on D only.

Three ~0.4s dissolves on 4×15s → ~**58.8s**.

---

## When you smoke later

**UNPIN:** `split_pep_beats`, `gather_pep_clips`, plus the usual talking-path nodes.

**NEVER PIN:** `grok_imagine_reel_still`, `tts_pep_voice_over`, `pep_lipsync_fal`

One Test workflow = 4 stills + 4 TTS + 4 OmniHuman 1080p. Budget a long wait (four × up to 1200s).
