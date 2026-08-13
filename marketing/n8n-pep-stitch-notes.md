# Pep TTS + lip-sync + stitch notes

## Goal
For each beat (or the master cut): **ElevenLabs VO → OmniHuman talking clip → final MP4**.

One workflow: Pep still + TTS fal URL → `prep_pep_lipsync` → `pep_lipsync_fal` (OmniHuman v1.5) → `save_lipsync_video_url`.  
Kling I2V is optional walk B-roll only — keep it disconnected from the talking path.  
Full A→B→C→D stitch can wait until Beat A OmniHuman looks right. See `marketing/n8n-pep-lipsync-setup.md`.

## Order (locked)
1. `tts_pep_voice_over` (ElevenLabs) → fal CDN `file_url` on `fal_upload_tts_initiate`
2. Grok EDIT still → `save_still_url.reel_still_url`
3. fal OmniHuman v1.5 (`pep_lipsync_fal`) → `lipsync_video_url`
4. Later: concat talking beats / or stitch then one VO

## Node: `tts_pep_voice_over` (ElevenLabs — preferred)
**Beat A smoke text:** `{{ $('prep_pep_beats').item.json.vo_beat_a }}`  
**Full cut text:** `{{ $('prep_pep_beats').item.json.voice_over }}`

### ElevenLabs TTS (HTTP Request) — locked for Pep
- Voice ID (Sal locked): `yl2ZDV1MzN4HbQJbMihG`
- POST `https://api.elevenlabs.io/v1/text-to-speech/yl2ZDV1MzN4HbQJbMihG?output_format=mp3_44100_128`
- Header: `xi-api-key` = Sal’s ElevenLabs key
- Header: `Accept` = `audio/mpeg`
- Body JSON example:

```json
{
  "text": "={{ $('prep_pep_beats').item.json.vo_beat_a || $('prep_pep_beats').item.json.voice_over }}",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": { "stability": 0.45, "similarity_boost": 0.8 }
}
```

- Binary MP3 → upload to public host → `tts_audio_url`

## Node: talking clip (`pep_lipsync_fal` — OmniHuman v1.5)
- Model: `fal-ai/bytedance/omnihuman/v1.5`
- Required: `image_url` (Pep still from `save_still_url`) + `audio_url` (`fal_upload_tts_initiate.file_url`)
- Optional: `resolution` `720p`, `prompt`
- Do **not** send `video_url` (that is sync-3)
- Prep code: `marketing/n8n-pep-prep-lipsync.js`
- Full steps: `marketing/n8n-pep-lipsync-setup.md`

## Node: `stitch_pep_master` (after all beats)

Each OmniHuman clip starts and ends **mid-stride** (same walk direction). When Beat B/C/D stills exist, use the next still as the start image so the clip lands on the next shot.

### CapCut (now)
1. Timeline: OmniHuman A, then B, then C, then D (9:16).
2. At each join (A→B, B→C, C→D): **Cross Dissolve / Film Dissolve**, **8–12 frames** (~0.3–0.5s). Not fade-to-black.
3. Do **not** fade in/out every clip or it will feel like four ads.
4. Optional 6–8 frame fade in on Beat A only, fade out on Beat D only.

Three 0.5s dissolves on 4×15s clips → finished length ~**58.5s**. Use 8 frames if you need closer to 60s.

### ffmpeg (later, `stitch_pep_master`)
```bash
ffmpeg -y -i a.mp4 -i b.mp4 -i c.mp4 -i d.mp4 -filter_complex \
"[0][1]xfade=transition=fade:duration=0.4:offset=14.6[ab]; \
 [ab][2]xfade=transition=fade:duration=0.4:offset=29.2[abc]; \
 [abc][3]xfade=transition=fade:duration=0.4:offset=43.8[v]" \
-map "[v]" -c:v libx264 -pix_fmt yuv420p pep-60s.mp4
```
Offset math: clip length 15 minus dissolve 0.4. Three dissolves → ~58.8s.

### Fallback — no ffmpeg yet
1. Ship Beat A OmniHuman first  
2. Manual stitch in CapCut with the dissolves above  
3. Add `stitch_pep_master` later  

## Timing
- Beat A smoke: ~15s video + `vo_beat_a`  
- Full: 4 × 15s with short dissolves ≈ **58–60s** + VO / disclaimer at end
- Walk direction is locked (toward camera, slight 3/4, screen-right) so dissolves hide the remaining pose mismatch.
