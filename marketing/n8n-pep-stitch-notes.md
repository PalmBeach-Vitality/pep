# Pep TTS + lip-sync + stitch notes

## Goal
For each scene cut: **ElevenLabs VO → OmniHuman talking clip → final MP4**.

One workflow: `(split_pep_beats)` runs the talking chain **twice** (two scene cuts, unique pose each) → `gather_pep_clips`.
These are **separate scenes**, not one smooth 60s blend. Hard cut if you concat.
Spoken VO is **intro + product only** on **every** clip. Last sentence always: `Visit us at palmbeach-vitality.store.` No compliance/disclaimer.

## Order (locked)
1. `tts_pep_voice_over` (ElevenLabs) → fal CDN `file_url` on `fal_upload_tts_initiate`
2. Grok EDIT still → `save_still_url.reel_still_url`
3. fal OmniHuman v1.5 (`pep_lipsync_fal`) → `lipsync_video_url`

## Node: `tts_pep_voice_over` (ElevenLabs — preferred)
**Per-scene text:** the **same** product sales pitch on all four `(split_pep_beats)` items. Last sentence: `Visit us at palmbeach-vitality.store.`
Do **not** send the full sheet `voice_over` into one 1080p OmniHuman job.
Do **not** speak FDA / not-for-human-use / laboratory-research-use-only / `disclaimer_short`.

### ElevenLabs TTS (HTTP Request) — locked for Pep
- Voice ID (Sal locked): `yl2ZDV1MzN4HbQJbMihG`
- POST `https://api.elevenlabs.io/v1/text-to-speech/yl2ZDV1MzN4HbQJbMihG?output_format=mp3_44100_128`
- Header: `xi-api-key` = Sal’s ElevenLabs key
- Header: `Accept` = `audio/mpeg`
- Body JSON example:

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
    throw new Error('TTS text is an n8n expression, not the sheet VO.');
  }
  return JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.45, similarity_boost: 0.8 }
  });
})() }}
```

- Binary MP3 → upload to public host → `tts_audio_url`

## Node: talking clip (`pep_lipsync_fal` — OmniHuman v1.5)
- Model: `fal-ai/bytedance/omnihuman/v1.5`
- Required: `image_url` (Pep still from `save_still_url`) + `audio_url` (`fal_upload_tts_initiate.file_url`)
- Optional: `resolution` `1080p`, `prompt`
- Do **not** send `video_url` (that is sync-3)
- Prep code: `marketing/n8n-pep-prep-lipsync.js`
- Full steps: `marketing/n8n-pep-lipsync-setup.md`

## Node: `stitch_pep_master` (optional later)

Do **not** dissolve A+B into one 60s film. Each OmniHuman file is its own scene cut.

### If you concat later
1. Timeline: OmniHuman A, then B (9:16).
2. Join A→B: **hard cut**. No CapCut AI morph / blend-as-one-film.
3. No extra voiceover track — VO is already inside each mp4.

### ffmpeg (later, only if Sal asks to concat)
```bash
ffmpeg -y -i a.mp4 -i b.mp4 -filter_complex \
"[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
-map "[v]" -map "[a]" -c:v libx264 -pix_fmt yuv420p pep-two-scenes.mp4
```

### Fallback
1. Copy `lipsync_video_url_a` and `lipsync_video_url_b` from `gather_pep_clips` OUTPUT
2. Keep them as two clips. Hard-cut concat only if needed.

## Timing
- Two ~30s 1080p OmniHuman clips with unique blocking per scene
- Not four cuts. Not one blended 60s
