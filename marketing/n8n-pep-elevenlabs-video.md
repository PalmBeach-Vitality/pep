# Pep video stack — ElevenLabs intent + n8n automation

**Decision (Sal):** cartoon-friendly video quality like ElevenLabs Image & Video / Flows.  
**Constraint:** ElevenLabs **Flows / Image & Video has no public API yet** (API/SDK “coming soon”; waitlist: [Flows API access](https://elevenlabs.io/flows)). UI-only today.

## Locked stack for weekly n8n

| Layer | Tool | Why |
|---|---|---|
| Pep still (character lock) | Grok `/v1/images/edits` + master PNG | Identical Pep every beat |
| Beat video (I2V) | **Kling Video v3 Pro** via **fal.ai** | Same cartoon-strong model family ElevenLabs exposes in Image & Video; callable from n8n |
| Voiceover | **ElevenLabs TTS** API | Best VO; already documented in stitch notes |
| Final cut | ffmpeg stitch A→B→C→D + mux VO | ~60s 9:16 |

Keep **exact canvas node names** (`prep_grok_video_start`, `grok_video_start`, `grok_video_poll`, …). Only change the HTTP URL + body inside those nodes — do not rename.

## Manual taste tests (optional)

Until Flows API ships, Sal can smoke cartoon motion in the ElevenLabs UI (Image & Video / Flows) with the Pep still as start frame + Kling. Automation stays on fal so the weekly job does not block on the waitlist.

## fal Kling — n8n wiring (Beat A)

Credential: Header Auth  
- Name: `Authorization`  
- Value: `Key <FAL_KEY>`

### `grok_video_start` (HTTP Request)
- Method: **POST**
- URL: `https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video`
- Body JSON: `{{ $json.video_request_body }}` from `prep_grok_video_start`  
  (or paste `video_request_body_string`)

Expected response includes `request_id`.

### `grok_video_poll` (HTTP Request + Wait loop)
1. Status GET:  
   `https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video/requests/{{ $json.request_id }}/status`
2. When status is `COMPLETED`, result GET:  
   `https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video/requests/{{ $('grok_video_start').item.json.request_id }}`
3. Video URL: `{{ $json.video.url }}` → `save_video_url`

Use Wait + IF until completed (same pattern as landscape fal polls if you already have one).

### Request body shape (from prep code)

```json
{
  "prompt": "...cartoon-friendly motion prompt...",
  "start_image_url": "<reel_still_url>",
  "duration": "15",
  "generate_audio": false,
  "negative_prompt": "blur, distort, low quality, human people, hospital, doctor office, black twist cap, screw cap, on-screen text, safety placard"
}
```

`generate_audio: false` — we mux ElevenLabs VO later; avoid Kling speech fighting Pep TTS.

## Sheet / CSV field

`model_video` = `fal-kling-v3-pro-i2v`  
(meaning: Kling v3 Pro I2V through fal, ElevenLabs-style cartoon target)

## When ElevenLabs Flows API ships

Swap only the HTTP targets inside `grok_video_start` / `grok_video_poll` (and update `model_video`). Keep node names, still lock, TTS, and stitch.
