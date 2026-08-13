# Pep video stack — ElevenLabs intent + n8n automation

**Decision (Sal):** cartoon-friendly video quality like ElevenLabs Image & Video / Flows.  
**Constraint:** ElevenLabs **Flows / Image & Video has no public API yet** (API/SDK “coming soon”; waitlist: [Flows API access](https://elevenlabs.io/flows)). UI-only today.

## Locked stack for weekly n8n

| Layer | Tool | Why |
|---|---|---|
| Pep still (character lock) | Grok `/v1/images/edits` + master PNG | Identical Pep every beat |
| Talking clip | **OmniHuman v1.5** via **fal.ai** (`pep_lipsync_fal`) | Image + ElevenLabs audio → mouth + body motion |
| Walk B-roll (optional) | **Kling Video v3 Pro** via **fal.ai** | Keep disconnected from the talking path |
| Voiceover | **ElevenLabs TTS** API | Best VO; already documented in stitch notes |
| Final cut | ffmpeg stitch A→B→C→D | ~60s 9:16 |

Keep **exact canvas node names** (`prep_pep_lipsync`, `pep_lipsync_fal`, `save_lipsync_video_url`, plus optional Kling `prep_grok_video_start`, `ai_vid_generator`, `grok_video_poll`). Do not rename.

## Talking clip — OmniHuman (`pep_lipsync_fal`)

- Community node: `@fal-ai/n8n-nodes-fal`
- Model: `fal-ai/bytedance/omnihuman/v1.5`
- `image_url` = `save_still_url.reel_still_url`
- `audio_url` = `fal_upload_tts_initiate.file_url`
- `resolution` = `1080p`
- Wait for Completion ON
- Max Wait Time = `900`
- Full params: `marketing/n8n-pep-lipsync-setup.md`

## Optional Kling walk B-roll

Keep disconnected from the talking path. Live Kling POST is **`ai_vid_generator`** (not `grok_video_start`). Setup: `marketing/n8n-pep-fal-kling-setup.md`.

Until Flows API ships, Sal can smoke cartoon motion in the ElevenLabs UI if wanted. Weekly talking clips stay on OmniHuman.

## Full setup (account → n8n)
Talking: **`marketing/n8n-pep-lipsync-setup.md`**  
Optional Kling: **`marketing/n8n-pep-fal-kling-setup.md`**

## fal Kling — n8n wiring (optional B-roll only)

**Preferred:** HTTP on **`ai_vid_generator`** (live canvas name).  
**Fallback:** official fal community node `@fal-ai/n8n-nodes-fal`.

### `ai_vid_generator` (HTTP)
- Credential: fal.ai API key
- POST `https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video`
- Body `={{ JSON.parse($json.video_request_body_string) }}` from `prep_grok_video_start`

### `grok_video_poll`
- Poll `status_url` until `COMPLETED`
- Then GET `response_url` on **`(kling_video_result)`** — poll status has no `video.url`

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

`model_video` = `fal-omnihuman-v1.5` for the talking clip.  
Optional Kling B-roll stays `fal-kling-v3-pro-i2v` if that chain is used.

## When ElevenLabs Flows API ships

Swap only the talking model inside `pep_lipsync_fal` if a better image+audio model ships. Keep node names, still lock, TTS, and stitch.
