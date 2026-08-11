# Pep stitch + TTS notes (~60s master)

## Goal
Concat beat videos **A → B → C → D** (~15s each) and mux `tts_pep_voice_over` into one **~60s** 9:16 MP4.

## Node: `tts_pep_voice_over` (ElevenLabs — preferred)
**Input text:** `{{ $('prep_day_variants').item.json.voice_over }}`  
**Fallback:** join `vo_beat_a`…`vo_beat_d`.

### ElevenLabs TTS (HTTP Request) — locked for Pep
- POST `https://api.elevenlabs.io/v1/text-to-speech/{{voice_id}}`
- Header: `xi-api-key` = Sal’s ElevenLabs key
- Header: `Accept` = `audio/mpeg`
- Body JSON example:

```json
{
  "text": "{{ $('prep_day_variants').item.json.voice_over }}",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": { "stability": 0.45, "similarity_boost": 0.8 }
}
```

- Save binary/file URL → `tts_audio_url`
- Use a warm, clear brand voice ID Sal picks once; store as workflow static data / credential note

### Fallback — OpenAI TTS
Only if ElevenLabs is down:
- POST `https://api.openai.com/v1/audio/speech`
- model: `tts-1` or `gpt-4o-mini-tts`
- voice: Sal’s choice
- input: Pep `voice_over`

## Node: `stitch_pep_master`

### Preferred — ffmpeg (self-hosted n8n Execute Command)
1. Download beat_a/b/c/d mp4 + tts audio  
2. `ffmpeg -i a.mp4 -i b.mp4 -i c.mp4 -i d.mp4 -filter_complex concat=n=4:v=1:a=0` (or concat demuxer)  
3. Mux VO: `-i voice.mp3 -shortest -c:v copy -c:a aac`  
4. Upload result (S3 / Drive / Files API) → `final_video_url`

### Fallback — no ffmpeg yet
1. Ship Phase D only (4 beat URLs saved)  
2. Manual stitch once in CapCut/Descript to validate taste  
3. Add ffmpeg/merge API in a follow-up node pass  

## Timing
- 4 × 15s visuals = 60s (fal Kling duration `"15"`)  
- Trim VO to ≤60s or let `-shortest` cut on video length  
- Disclaimer must remain audible at the end

## Video provider note
Beat clips come from **fal Kling v3 Pro I2V** (see `n8n-pep-elevenlabs-video.md`).  
ElevenLabs Image & Video / Flows is the taste target; TTS uses the ElevenLabs API today.
