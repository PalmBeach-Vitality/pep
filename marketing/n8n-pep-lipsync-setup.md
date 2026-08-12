# Pep lip-sync (locked wire)

Order: **ElevenLabs TTS → fal storage upload → Kling talking clip → fal Sync Lipsync v3**

Do not use Catbox for fal audio inputs. Use fal `file_url` only.

## Exact sequence (from canvas)

```text
prep_pep_beats
  → tts_pep_voice_over
  → fal_upload_tts_initiate
  → fal_upload_tts_put
  → save_tts_audio_url
  → grok_imagine_reel_still
  → save_still_url
  → prep_grok_video_start
  → ai_vid_generator
  → Wait
  → grok_video_poll
  → HTTP Request
  → save_video_url
  → prep_pep_lipsync
  → pep_lipsync_start
  → Wait
  → pep_lipsync_poll
  → pep_lipsync_result
  → save_lipsync_video_url
  → sheets_update_creation
```

---

## From `fal_upload_tts_initiate` (restore these)

Requires `tts_pep_voice_over` output binary field **`data`** on the same path.

### 1) `fal_upload_tts_initiate` (HTTP)

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3` |
| Auth | fal.ai API credential |
| Send Body | ON · JSON |
| Body | see below |

```json
{
  "content_type": "audio/mpeg",
  "file_name": "pep-beat-a.mp3"
}
```

Expect: `upload_url`, `file_url`

### 2) `fal_upload_tts_put` (HTTP)

| Setting | Value |
|---|---|
| Method | `PUT` |
| URL | `={{ $('fal_upload_tts_initiate').item.json.upload_url }}` |
| Auth | none (signed URL) |
| Send Body | ON · **n8n Binary File** |
| Input Data Field Name | `data` |
| Header | `Content-Type` = `audio/mpeg` |

**Important:** binary `data` must still be on the item. If PUT loses binary, set **fal_upload_tts_initiate** options to include input binary, or put a Merge — simplest: on initiate, Options → Response → put response in a field and keep binary from previous node (Include Binary Data / don’t drop binary).

If binary is empty: re-execute from `tts_pep_voice_over` so `data` exists, then run initiate → put.

### 3) `save_tts_audio_url` (Edit Fields)

| Name | Value |
|---|---|
| `tts_audio_url` | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| `beat` | `a` |

Include Other Input Fields: **ON**

### 4) … still + Kling … → `save_video_url`

Keep your existing still/video chain. `video_url` must be set.

### 5) `prep_pep_lipsync` (Code)

Paste: `marketing/n8n-pep-prep-lipsync.js`  
Mode: **Run Once for All Items**  
Language: **JavaScript**

### 6) `pep_lipsync_start` (HTTP)

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://queue.fal.run/fal-ai/sync-lipsync/v3` |
| Auth | fal.ai API credential |
| Body | `={{ $json.lipsync_request_body }}` |
| Timeout | `300000` |

Fallback body: `={{ JSON.parse($json.lipsync_request_body_string) }}`

### 7) `Wait` — 60s

### 8) `pep_lipsync_poll` (HTTP)

| Setting | Value |
|---|---|
| Method | `GET` |
| URL | `={{ $json.status_url }}` |
| Auth | fal credential |

### 9) `pep_lipsync_result` (HTTP)

Only when poll `status` = `COMPLETED`

| Setting | Value |
|---|---|
| Method | `GET` |
| URL | `={{ $('pep_lipsync_start').item.json.response_url }}` |
| Auth | fal credential |

### 10) `save_lipsync_video_url` (Edit Fields)

| Name | Value |
|---|---|
| `lipsync_video_url` | `={{ $json.video.url }}` |
| `video_url` | `={{ $json.video.url }}` |
| `tts_audio_url` | `={{ $('save_tts_audio_url').item.json.tts_audio_url }}` |
| `creation_id` | `={{ $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | `a` |
| `model_video` | `fal-sync-lipsync-v3` |

Then → `sheets_update_creation`

---

## Run rule

Execute from **`tts_pep_voice_over`** (or earlier) so binary `data` + path to `$('…')` refs exist.  
Do **not** execute mid-chain nodes alone unless their upstream already ran in the same execution.
