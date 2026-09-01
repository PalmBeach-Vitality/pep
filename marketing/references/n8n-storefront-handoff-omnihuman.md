# Storefront-agent handoff — wire into `vid_gen_palm_beach_pep`

Saved 2026-08-13 from the storefront agent. Source of the locked OmniHuman keeper.

**Locked result:** OmniHuman v1.5 image + audio is the keeper. Sal: “That looks PERFECT.” Stop video-to-video lipsync (Sync-3, VEED, Kling lipsync, LatentSync). Do not splice clips.

**Keeper clip:** https://v3b.fal.media/files/b/0aa63765/PodRjpU1AXRlCQ-iw5eOX_video.mp4  
**Open-mouth still:** https://v3b.fal.media/files/b/0aa6373b/SMgvhKAFxp1nWiyvnnD7p_pep-openmouth-still.jpg  
**Speech wav:** https://v3b.fal.media/files/b/0aa635c9/Da599Vpkt4NS7oUZD6ZFq_full-audio.wav  
**Model:** `fal-ai/bytedance/omnihuman/v1.5`  
**Args:** `image_url` + `audio_url` + `resolution: "1080p"`  
**Specs:** 1088×1920, ~15.2s. Fal CDN links expire — local copies in `marketing/assets/`. See `marketing/n8n-pep-omnihuman-keeper.txt`.

**What failed:** Sync-3 mouth lag ~3s then closed; VEED froze ~5–6s; splices were choppy; Catbox URLs 422 on fal; hardcoded `pep-beat-a.mp3` reused the same VO every run.

**Next job Sal asked for:** each workflow execution must get a unique scene and a unique voiceover. Do not pin `grok_imagine_reel_still`, `tts_pep_voice_over`, or `pep_lipsync_fal`. Do not hardcode Audio Url.

Canvas changes (keep exact names) are wired in:

- `marketing/n8n-pep-lipsync-setup.md`
- `marketing/n8n-pep-full-paste-codes.md`
- `marketing/n8n-vid-gen-palm-beach-pep-execute.md`

Do not rename: `if_complaince`, `pep_lipsync_fal`, `prep_pep_lipsync`, `fal_upload_tts_initiate`. There is no `save_tts_audio_url` on canvas.
