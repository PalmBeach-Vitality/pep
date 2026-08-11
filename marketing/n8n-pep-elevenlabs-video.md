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

## Full setup (account → n8n)
Step-by-step: **`marketing/n8n-pep-fal-kling-setup.md`**

## fal Kling — n8n wiring (Beat A)

**Preferred:** official fal community node `@fal-ai/n8n-nodes-fal` on node `grok_video_start` (keep the name).  
**Fallback:** HTTP Header Auth + queue submit/poll (setup doc appendix).

### `grok_video_start` (fal node)
- Install: Settings → Community Nodes → `@fal-ai/n8n-nodes-fal`
- Credential: fal.ai API key
- Operation: Generate Media / Image to Video
- Model: `fal-ai/kling-video/v3/pro/image-to-video`
- Map prompt + `start_image_url` (+ duration `15`, `generate_audio: false`) from `prep_grok_video_start`

### `grok_video_poll`
- Skip/pass-through if the fal node waits for completion and returns `video.url`
- Else poll `request_id` until `COMPLETED` (HTTP appendix in setup doc)

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
