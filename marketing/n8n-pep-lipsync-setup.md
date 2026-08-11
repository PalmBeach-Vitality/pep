# Pep lip-sync NOW (Beat A smoke)

Order: **TTS → (public audio URL) → Kling talking clip → fal Sync Lipsync v3**

Do not mux blind VO over a frozen mouth. Lip-sync locks mouth to audio.

## Nodes (suggested names)

```text
prep_pep_beats
  → tts_pep_voice_over          (ElevenLabs — Beat A text only for 15s smoke)
  → save_tts_audio_url          (must be a public https audio URL)
  → … still + ai_vid_generator … (talking performance clip, silent)
  → save_video_url
  → prep_pep_lipsync
  → pep_lipsync_start           (fal sync-lipsync/v3)
  → pep_lipsync_poll
  → save_lipsync_video_url
```

---

## 1) `tts_pep_voice_over` (ElevenLabs)

For **Beat A only** smoke (match ~15s video):

**Text:**
```text
={{ $('prep_pep_beats').item.json.vo_beat_a || $('prep_pep_beats').item.json.voice_over }}
```

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.elevenlabs.io/v1/text-to-speech/yl2ZDV1MzN4HbQJbMihG?output_format=mp3_44100_128` |
| Header | `xi-api-key` = ElevenLabs key |
| Header | `Accept` = `audio/mpeg` |
| Body JSON | see below |

```json
{
  "text": "={{ $('prep_pep_beats').item.json.vo_beat_a || $('prep_pep_beats').item.json.voice_over }}",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": { "stability": 0.45, "similarity_boost": 0.8 }
}
```

Response = **binary MP3**. fal lipsync needs a **public URL**, so next:

### Make `tts_audio_url` public
Pick one:
- Upload binary to Drive/S3/catbox/fal storage → save URL as `tts_audio_url`
- Or temporary host Sal already uses

`save_tts_audio_url`:
| Name | Value |
|---|---|
| `tts_audio_url` | public `https://…mp3` |
| `beat` | `a` |

---

## 2) Kling clip (you already have this)
Keep talking-mouth prompt on `prep_grok_video_start` → `ai_vid_generator` → `save_video_url`  
`video_url` = silent talking performance.

---

## 3) `prep_pep_lipsync` (Code — optional but clean)

```javascript
const videoUrl =
  $('save_video_url').item.json.video_url ||
  '';
const audioUrl =
  $('save_tts_audio_url').item.json.tts_audio_url ||
  '';

if (!videoUrl) throw new Error('Missing video_url');
if (!audioUrl) throw new Error('Missing tts_audio_url (public https)');

const lipsync_request_body = {
  video_url: String(videoUrl),
  audio_url: String(audioUrl),
  sync_mode: 'cut_off',
};

return [{
  json: {
    video_url: videoUrl,
    tts_audio_url: audioUrl,
    lipsync_request_body,
    lipsync_request_body_string: JSON.stringify(lipsync_request_body),
    fal_lipsync_endpoint: 'fal-ai/sync-lipsync/v3',
  }
}];
```

---

## 4) `pep_lipsync_start` (HTTP — same fal credential)

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://queue.fal.run/fal-ai/sync-lipsync/v3` |
| Auth | fal.ai API credential |
| Send Body | ON · JSON |
| Body | `={{ $json.lipsync_request_body }}` |
| Timeout | `300000` |

Expect `request_id` / `status_url` / `response_url`.

---

## 5) `pep_lipsync_poll` (GET — same as Kling poll)

Status:
```text
{{ $json.status_url }}
```
or
```text
https://queue.fal.run/fal-ai/sync-lipsync/v3/requests/{{ $('pep_lipsync_start').item.json.request_id }}/status
```

When `COMPLETED`, GET `response_url` → `{{ $json.video.url }}`

---

## 6) `save_lipsync_video_url`

| Name | Value |
|---|---|
| `lipsync_video_url` | `{{ $json.video.url }}` |
| `video_url` | `{{ $json.video.url }}` |
| `tts_audio_url` | `{{ $('save_tts_audio_url').item.json.tts_audio_url }}` |
| `creation_id` | `{{ $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | `a` |

---

## Beat A smoke checklist
- [ ] ElevenLabs VO for `vo_beat_a` (~15s)
- [ ] Public `tts_audio_url`
- [ ] Kling talking clip on approved still
- [ ] fal `sync-lipsync/v3` completes
- [ ] Mouth tracks VO; Pep still looks like master

## Full 60s later
TTS full `voice_over` → 4 talking beats → lipsync each beat (or one stitched silent master + one VO) → final mux.
