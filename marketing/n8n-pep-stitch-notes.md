# Pep TTS + lip-sync + stitch notes

## Goal
For each beat (or the master cut): **ElevenLabs VO → lip-sync mouth to audio → final MP4**.

Do lip-sync **now** on Beat A smoke (see `marketing/n8n-pep-lipsync-setup.md`).  
Full A→B→C→D stitch can wait until Beat A lipsync looks right.

## Order (locked)
1. `tts_pep_voice_over` (ElevenLabs) → public `tts_audio_url`
2. Kling talking clip → `video_url` (silent)
3. fal `sync-lipsync/v3` → `lipsync_video_url`
4. Later: concat lipsynced beats / or stitch then one VO

## Node: `tts_pep_voice_over` (ElevenLabs — preferred)
**Beat A smoke text:** `{{ $('prep_pep_beats').item.json.vo_beat_a }}`  
**Full cut text:** `{{ $('prep_pep_beats').item.json.voice_over }}`

### ElevenLabs TTS (HTTP Request)
- POST `https://api.elevenlabs.io/v1/text-to-speech/{{voice_id}}?output_format=mp3_44100_128`
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

## Node: lip-sync (fal)
- POST `https://queue.fal.run/fal-ai/sync-lipsync/v3`
- Body: `{ "video_url", "audio_url", "sync_mode": "cut_off" }`
- Prep code: `marketing/n8n-pep-prep-lipsync.js`
- Full steps: `marketing/n8n-pep-lipsync-setup.md`

## Node: `stitch_pep_master` (after all beats)

### Preferred — ffmpeg (self-hosted n8n Execute Command)
1. Download lipsynced beat_a/b/c/d mp4  
2. `ffmpeg` concat  
3. Upload → `final_video_url`

### Fallback — no ffmpeg yet
1. Ship Beat A lipsync first  
2. Manual stitch in CapCut once for taste  
3. Add ffmpeg later  

## Timing
- Beat A smoke: ~15s video + `vo_beat_a`  
- Full: 4 × 15s + full `voice_over` ≤60s / disclaimer at end
