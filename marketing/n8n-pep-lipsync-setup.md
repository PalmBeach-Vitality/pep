# Pep lipsync — FULL n8n parameters (no shortcuts)

**Rule for agents:** Always give Sal the **complete** parameter list for every node (Method, URL, Auth, Headers, Body, Options, field types). No abbreviated “see below / same as Kling” replies.

**Wire (exact):**
```text
tts_pep_voice_over
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
  → Wait          (lipsync wait — 60 seconds)
  → pep_lipsync_poll
  → pep_lipsync_result
  → save_lipsync_video_url
  → sheets_update_creation
```

Execute from `tts_pep_voice_over` or earlier so binary `data` and `$('…')` paths exist.

Do **not** use Catbox URLs as fal `audio_url`. Use fal `file_url` only.

**Locked:** lipsync nodes stay as-is. Mouth motion for the full 15s comes from the Kling clip (`prep_grok_video_start` walk+talk lock). Do not disconnect this chain.

---

## Node: `tts_pep_voice_over`

| Parameter | Value |
|---|---|
| Node type | HTTP Request |
| Exact name | `tts_pep_voice_over` |
| Method | `POST` |
| URL | `https://api.elevenlabs.io/v1/text-to-speech/yl2ZDV1MzN4HbQJbMihG?output_format=mp3_44100_128` |
| Authentication | None (use header key) |
| Send Headers | ON |
| Header 1 Name | `xi-api-key` |
| Header 1 Value | *(your ElevenLabs API key)* |
| Header 2 Name | `Accept` |
| Header 2 Value | `audio/mpeg` |
| Header 3 Name | `Content-Type` |
| Header 3 Value | `application/json` |
| Send Body | ON |
| Body Content Type | JSON |
| Specify Body | Using JSON |
| JSON Body | see block below |
| Options → Response → Response Format | **File** |
| Options → Response → Put Output in Field | `data` |
| Options → Timeout | `120000` |

**JSON Body:**
```json
{
  "text": "={{ $('prep_pep_beats').item.json.vo_beat_a || $('prep_pep_beats').item.json.voice_over }}",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.45,
    "similarity_boost": 0.8
  }
}
```

**Expect output:** Binary property named `data` (audio/mpeg).

---

## Node: `fal_upload_tts_initiate`

| Parameter | Value |
|---|---|
| Node type | HTTP Request |
| Exact name | `fal_upload_tts_initiate` |
| Method | `POST` |
| URL | `https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3` |
| Authentication | Generic Credential Type → Header Auth **or** fal.ai API credential |
| Auth header | `Authorization` = `Key YOUR_FAL_KEY` *(same key as Kling)* |
| Send Query Parameters | OFF |
| Send Headers | ON (if not using credential that already sets Auth) |
| Header Name | `Content-Type` |
| Header Value | `application/json` |
| Send Body | ON |
| Body Content Type | JSON |
| Specify Body | Using JSON |
| JSON Body | see block below |
| Options → Response → Response Format | Autodetect / JSON |
| Options → Response → Include Response Headers and Status | OFF |
| Options → Timeout | `60000` |
| **Critical** | Must **keep incoming binary** `data` for the next node. If your n8n version has “Include Binary Data” / does not strip binary on HTTP JSON responses, leave that enabled. If binary is dropped after this node, use a Merge of TTS binary + initiate JSON before PUT. |

**JSON Body:**
```json
{
  "content_type": "audio/mpeg",
  "file_name": "pep-beat-a.mp3"
}
```

**Expect output JSON:**
- `upload_url` (signed PUT URL)
- `file_url` (public CDN URL to use later as `tts_audio_url`)

**Expect binary still present:** `data` from `tts_pep_voice_over`

---

## Node: `fal_upload_tts_put`

| Parameter | Value |
|---|---|
| Node type | HTTP Request |
| Exact name | `fal_upload_tts_put` |
| Method | `PUT` |
| URL | `={{ $('fal_upload_tts_initiate').item.json.upload_url }}` |
| Authentication | None *(signed URL already has auth)* |
| Send Headers | ON |
| Header 1 Name | `Content-Type` |
| Header 1 Value | `audio/mpeg` |
| Send Body | ON |
| Body Content Type | n8n Binary File |
| Input Data Field Name | `data` |
| Options → Timeout | `120000` |

**Expect:** HTTP 200 / empty or OK body. Binary uploaded to fal.

If error **“No fields / empty binary”**: `data` was lost. Re-run from `tts_pep_voice_over`, or Merge binary back onto the item before this PUT.

---

## Node: `save_tts_audio_url`

| Parameter | Value |
|---|---|
| Node type | Set / Edit Fields |
| Exact name | `save_tts_audio_url` |
| Mode | Manual Mapping |
| Include Other Input Fields | **ON** |
| Include Binary | OFF (unless you need it later) |

**Fields:**

| Field Name | Field Type | Value |
|---|---|---|
| `tts_audio_url` | String | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| `beat` | String | `a` |

**Expect:** `tts_audio_url` starts with `https://` and is on `fal.media` / `v3.fal.media` / `v3b.fal.media`.

---

## Nodes between audio save and lipsync (already on canvas — do not rename)

Keep exactly as built:

```text
save_tts_audio_url
  → grok_imagine_reel_still
  → save_still_url
  → prep_grok_video_start
  → kling_video_request
  → Wait
  → grok_video_poll
  → kling_video_result
  → save_video_url
```

`save_video_url` must output:

| Field Name | Value |
|---|---|
| `video_url` | `={{ $json.video.url }}` *(or your existing working expression)* |

---

## Node: `prep_pep_lipsync`

| Parameter | Value |
|---|---|
| Node type | **Code** |
| Exact name | `prep_pep_lipsync` |
| Mode | **Run Once for All Items** |
| Language | **JavaScript** |
| Code | paste entire block below |

**Code (full):**
```javascript
// Node: prep_pep_lipsync
// Wire: save_video_url → prep_pep_lipsync → pep_lipsync_start
// Mode: Run Once for All Items
// Return plain objects — do NOT wrap in { json: ... }

const videoUrl = String($('save_video_url').item.json.video_url || '');
const audioUrl = String($('save_tts_audio_url').item.json.tts_audio_url || '');

if (!videoUrl) throw new Error('Missing video_url from save_video_url');
if (!audioUrl) throw new Error('Missing tts_audio_url from save_tts_audio_url');

const lipsync_request_body = {
  video_url: videoUrl,
  audio_url: audioUrl,
  sync_mode: 'cut_off',
};

let creation_id = '';
try {
  creation_id = String($('prep_pep_beats').item.json.creation_id || '');
} catch (e) {
  creation_id = '';
}

return [
  {
    creation_id: creation_id,
    beat: 'a',
    video_url: videoUrl,
    tts_audio_url: audioUrl,
    fal_lipsync_endpoint: 'fal-ai/sync-lipsync/v3',
    fal_lipsync_submit_url: 'https://queue.fal.run/fal-ai/sync-lipsync/v3',
    lipsync_request_body: lipsync_request_body,
    lipsync_request_body_string: JSON.stringify(lipsync_request_body),
  },
];
```

**Expect output fields:** `video_url`, `tts_audio_url`, `lipsync_request_body`, `lipsync_request_body_string`

---

## Node: `pep_lipsync_start`

| Parameter | Value |
|---|---|
| Node type | HTTP Request |
| Exact name | `pep_lipsync_start` |
| Method | `POST` |
| URL | `https://queue.fal.run/fal-ai/sync-lipsync/v3` |
| Authentication | Same fal credential as `kling_video_request` (`Authorization: Key YOUR_FAL_KEY`) |
| Send Headers | ON |
| Header Name | `Content-Type` |
| Header Value | `application/json` |
| Send Body | ON |
| Body Content Type | JSON |
| Specify Body | Using JSON |
| JSON Body | `={{ $json.lipsync_request_body }}` |
| Alternate JSON Body (if object expression fails) | `={{ JSON.parse($json.lipsync_request_body_string) }}` |
| Options → Timeout | `300000` |

**Expect output JSON:**
- `status` (e.g. `IN_QUEUE`)
- `request_id`
- `status_url`
- `response_url`
- `cancel_url`

---

## Node: `Wait` (lipsync)

| Parameter | Value |
|---|---|
| Node type | Wait |
| Exact name | `Wait` *(or `pep_lipsync_wait` if you already have another Wait — if renaming, keep wire clear)* |
| Resume | After Time Interval |
| Wait Amount | `60` |
| Wait Unit | Seconds |

**Wire:** `pep_lipsync_start` → this Wait → `pep_lipsync_poll`

---

## Node: `pep_lipsync_poll`

| Parameter | Value |
|---|---|
| Node type | HTTP Request |
| Exact name | `pep_lipsync_poll` |
| Method | `GET` |
| URL | `={{ $('pep_lipsync_start').item.json.status_url }}` |
| Authentication | Same fal credential |
| Send Query Parameters | OFF |
| Send Headers | OFF (unless credential needs manual Auth header) |
| Send Body | OFF |
| Options → Timeout | `60000` |

**Expect:** `status` = `IN_QUEUE` | `IN_PROGRESS` | `COMPLETED`

If not `COMPLETED`: Wait another 30–60s and execute poll again (or add IF loop later).

---

## Node: `pep_lipsync_result`

| Parameter | Value |
|---|---|
| Node type | HTTP Request |
| Exact name | `pep_lipsync_result` |
| Method | `GET` |
| URL | `={{ $('pep_lipsync_start').item.json.response_url }}` |
| Authentication | Same fal credential |
| Send Body | OFF |
| Options → Timeout | `60000` |

**Only run when** `pep_lipsync_poll` shows `status` = `COMPLETED`.

**Expect output JSON:**
```json
{
  "video": {
    "url": "https://v3b.fal.media/files/.../output.mp4"
  }
}
```

---

## Node: `save_lipsync_video_url`

| Parameter | Value |
|---|---|
| Node type | Set / Edit Fields |
| Exact name | `save_lipsync_video_url` |
| Mode | Manual Mapping |
| Include Other Input Fields | **ON** |

**Fields:**

| Field Name | Field Type | Value |
|---|---|---|
| `lipsync_video_url` | String | `={{ $json.video.url }}` |
| `video_url` | String | `={{ $json.video.url }}` |
| `tts_audio_url` | String | `={{ $('save_tts_audio_url').item.json.tts_audio_url }}` |
| `creation_id` | String | `={{ $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | String | `a` |
| `model_video` | String | `fal-sync-lipsync-v3` |

**Wire next:** `save_lipsync_video_url` → `sheets_update_creation`

---

## Checklist before execute

- [ ] `tts_pep_voice_over` Response Format = **File**, field = `data`
- [ ] `fal_upload_tts_initiate` returns `upload_url` + `file_url`
- [ ] `fal_upload_tts_put` Input Data Field Name = `data` (binary not empty)
- [ ] `save_tts_audio_url.tts_audio_url` is a fal CDN URL (not catbox)
- [ ] `save_video_url.video_url` is set
- [ ] `prep_pep_lipsync` is Code, returns plain objects (no `{ json: ... }` wrapper)
- [ ] `pep_lipsync_start` returns `status_url` + `response_url`
- [ ] Wait 60s before poll
- [ ] `pep_lipsync_result` GET `response_url` before save
- [ ] `save_lipsync_video_url.lipsync_video_url` is non-null playable mp4
