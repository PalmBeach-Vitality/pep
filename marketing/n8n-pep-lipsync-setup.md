# Pep talking clip — OmniHuman v1.5 (FULL n8n parameters)

**Rule for agents:** Always give Sal the **complete** parameter list for every node (Method, URL, Auth, Headers, Body, Options, field types). No abbreviated “see below / same as Kling” replies.

**Locked talking model:** ByteDance **OmniHuman v1.5** on fal (`fal-ai/bytedance/omnihuman/v1.5`).  
OmniHuman is **image + audio → talking video**. It does **not** take a Kling `video_url`. That is sync-3.

**Live canvas node for the job:** `pep_lipsync_fal` (fal.ai community node). Do **not** rename it.

**Not on canvas / do not invent:** `save_tts_audio_url`, `pep_lipsync_start`, `pep_lipsync_result`.

TTS public URL = `$('fal_upload_tts_initiate').item.json.file_url` (fal CDN). **Catbox is blocked by fal** for audio/video inputs. Master Catbox URL is OK only as Pep still *reference* for Grok EDIT.

Audio must be under **60s at 720p** (under 30s at 1080p). Pep VO is ~15s, so `720p` is the lock (fal: faster and higher quality).

---

## Talking wire (exact)

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
  → prep_pep_beats
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

Kling walk chain still exists — **leave it, do not delete**, keep it **disconnected** from this talking path:

```text
prep_grok_video_start → ai_vid_generator → Wait2 → Wait → grok_video_poll → kling_video_result → save_video_url
```

**Disconnect (do not delete/rename):** `fal_lipsync_call` → `Wait3` → `pep_lipsync_poll` → `pep_lip_sync_result`, and `kling_video_request`.

Execute with **Test workflow** (not Execute node) so `$('other_node')` has a path. Pin = n8n “Pin data” (thumbtack on OUTPUT). Frozen output is reused; Test workflow skips that API call.

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

**JSON Body:**
```json
{
  "content_type": "audio/mpeg",
  "file_name": "pep-beat-a.mp3"
}
```

**Expect output JSON:**
- `upload_url` (signed PUT URL)
- `file_url` (public fal CDN URL — this is OmniHuman `audio_url`)

---

## Node: `merge_tts_binary`

| Parameter | Value |
|---|---|
| Node type | Code |
| Exact name | `merge_tts_binary` |
| Mode | Run Once for All Items |
| Language | JavaScript |

```javascript
const initiate = $input.first();
const tts = $('tts_pep_voice_over').first();

if (!tts.binary || !tts.binary.data) {
  throw new Error('No binary data on tts_pep_voice_over — re-run TTS first');
}

return [
  {
    json: initiate.json,
    binary: tts.binary,
  },
];
```

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

**Expect:** HTTP 200. Binary uploaded to fal. OmniHuman reads `fal_upload_tts_initiate.file_url`.

---

## Node: `prep_pep_lipsync`

| Parameter | fx | Value |
|---|---|---|
| Node type | — | Code |
| Exact name | — | `prep_pep_lipsync` |
| Mode | — | **Run Once for Each Item** |
| Language | — | JavaScript |

Do **not** use Run Once for All Items. Do **not** `return [{ json: ... }]`.

Wire: `save_still_url` → `prep_pep_lipsync` → `pep_lipsync_fal`

Paste the full file `marketing/n8n-pep-prep-lipsync.js`.

**Expect OUTPUT fields:** `lipsync_image_in` (xAI still URL), `lipsync_audio_in` (fal CDN), `omnihuman_prompt`, `omnihuman_resolution` = `720p`.

---

## FAL NODE: `pep_lipsync_fal`

This is the official fal.ai community node (`@fal-ai/n8n-nodes-fal`), not HTTP Request.

| Parameter | fx | Value |
|---|---|---|
| Node type | — | fal.ai |
| Exact name | — | `pep_lipsync_fal` |
| Credential | — | fal.ai account |
| Resource | — | Model |
| Operation | — | Generate Media |
| Model | — | From list · **OmniHuman** / **Omnihuman v1.5** (`fal-ai/bytedance/omnihuman/v1.5`) |
| Parameter 1 Name | OFF | `image_url` |
| Parameter 1 Value | ON | `={{ $json.lipsync_image_in }}` |
| Parameter 2 Name | OFF | `audio_url` |
| Parameter 2 Value | ON | `={{ $json.lipsync_audio_in }}` |
| Parameter 3 Name | OFF | `resolution` |
| Parameter 3 Value | OFF | `720p` |
| Parameter 4 Name | OFF | `prompt` |
| Parameter 4 Value | ON | `={{ $json.omnihuman_prompt }}` |
| Wait for Completion | — | **ON** |
| Poll Interval (Seconds) | — | `5` |
| Max Wait Time (Seconds) | — | `600` |

Do **not** send `video_url`. That is sync-3. OmniHuman needs the Pep **still**.

Use `$json` from `prep_pep_lipsync` (avoids n8n error `[ERROR: No path back to node]`).

**Expect OUTPUT:** `{ "video": { "url": "https://..." } }`

---

## SET: `save_lipsync_video_url`

| Parameter | Value |
|---|---|
| Node type | Set / Edit Fields |
| Exact name | `save_lipsync_video_url` |
| Mode | Manual Mapping |
| Include Other Input Fields | **OFF** |

| Field Name | Field Type | fx | Value |
|---|---|---|---|
| `lipsync_video_url` | String | ON | `={{ $json.video.url }}` |
| `video_url` | String | ON | `={{ $json.video.url }}` |
| `tts_audio_url` | String | ON | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| `creation_id` | String | ON | `={{ $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | String | OFF | `a` |
| `model_video` | String | OFF | `fal-omnihuman-v1.5` |

**Wire next:** `save_lipsync_video_url` → `sheets_update_creation`

---

## Pin / unpin for one OmniHuman talking Test

**Pin** = n8n “Pin data” (thumbtack on OUTPUT). Saving params is free. **Test workflow** is what bills APIs.

**PIN:** `Schedule Trigger`, `get_rows_in_sheet`, `filter_active`, `sort_rotation`, `Limit`, `Prep_day_variant`, `grok_api`, `parse_grok`, `if_complaince`, `prep_pep_beats`, `tts_pep_voice_over`, `fal_upload_tts_initiate`, `merge_tts_binary`, `fal_upload_tts_put`, `grok_imagine_reel_still`, `save_still_url`, `prep_grok_video_start`, `ai_vid_generator`, `Wait2`, `Wait`, `grok_video_poll`, `kling_video_result`, `save_video_url`

**UNPIN:** `prep_pep_lipsync`, `pep_lipsync_fal`, `save_lipsync_video_url` (and `sheets_update_creation` if you want the sheet updated)

Leave disconnected: `fal_lipsync_call`, `Wait3`, `pep_lipsync_poll`, `pep_lip_sync_result`, `kling_video_request`.

Confirm `save_still_url.reel_still_url` is the no-thumbs xAI still (not Catbox). Confirm `fal_upload_tts_initiate.file_url` is a fal CDN URL.

Then **Test workflow** once. QC: mouth moves with VO, no thumbs-up.

---

## Checklist before Test workflow

- [ ] `pep_lipsync_fal` Model = **OmniHuman / Omnihuman v1.5** (not sync-3 Lipsync)
- [ ] Parameters are `image_url` + `audio_url` + `resolution` `720p` + `prompt` (no `video_url`)
- [ ] Wait for Completion **ON**
- [ ] `prep_pep_lipsync` Mode = Run Once for Each Item, returns a plain object
- [ ] `lipsync_image_in` is an xAI still URL (not Catbox)
- [ ] `lipsync_audio_in` is `fal_upload_tts_initiate.file_url` (not Catbox)
- [ ] `save_lipsync_video_url` Include Other Input Fields **OFF**
- [ ] `creation_id` fx **ON**
- [ ] Kling chain is pinned / disconnected so it does not bill
- [ ] Disconnected: `fal_lipsync_call`, `Wait3`, `pep_lipsync_poll`, `pep_lip_sync_result`
