# Pep stitch + TTS notes (~60s master)

## Goal
Concat beat videos **A → B → C → D** (~15s each) and mux `tts_pep_voice_over` into one **~60s** 9:16 MP4.

## Node: `tts_pep_voice_over`
**Input text:** `{{ $('prep_pep_beats').item.json.voice_over }}`  
**Fallback:** join `vo_beat_a`…`vo_beat_d`.

### Option A — OpenAI TTS (HTTP Request)
- POST `https://api.openai.com/v1/audio/speech`
- model: `tts-1` or `gpt-4o-mini-tts`
- voice: Sal’s choice (e.g. `alloy` / custom)
- input: Pep `voice_over`
- Save file/URL → `tts_audio_url`

### Option B — ElevenLabs (HTTP Request)
- Use Sal’s ElevenLabs credential / voice ID
- text: Pep `voice_over`
- Save file/URL → `tts_audio_url`

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

### Fallback B — Grok Extend chain
If stitch tooling is blocked: start from beat A video, call `/v1/videos/extensions` for B/C/D motion prompts, then mux TTS onto the extended file. Prefer still→video beats first for Pep likeness control.

## Timing
- 4 × 15s visuals = 60s  
- Trim VO to ≤60s or let `-shortest` cut on video length  
- Disclaimer must remain audible at the end
