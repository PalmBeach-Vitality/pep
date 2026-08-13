# Agent rulebook (Sal / Palm Beach Vitality)

## Spreadsheets
- Do **not** create, rename, overwrite, or modify any spreadsheet unless Sal names it by its **exact name** in that request.
- Reference-only mentions do **not** grant permission.

## CSV updates — always send the file link
**Every time** a `.csv` file is created or updated, the reply **must** include a hard link to that file in the same message.

Use the branch blob URL form:

`https://github.com/PalmBeach-Vitality/pep/blob/<branch>/<path>`

Also include the matching `raw.githubusercontent.com` URL when Sal needs a direct download/import URL.

Do not only say “updated the CSV” — always paste the link(s).

Example (current Pep scenes sheet):

`https://github.com/PalmBeach-Vitality/pep/blob/cursor/palm-beach-pep-scenes-8510/marketing/sheets/150-pb-pep-scenes.csv`

## Always send hard links after file updates
Whenever you update a file Sal needs to download, import, or open, **immediately include the hard link** in the same reply.

Use the same blob URL form as above. Raw GitHub URLs are fine for direct download/import.

## n8n
- New node names: `lower_case_with_underscores`
- One node (or tight group) at a time, with exact node names
- **When telling Sal to add a node, always wrap the new node name in parentheses:** `(kling_video_result)`. Wire as `before_node` → **`(new_node)`** → `after_node`. Existing canvas nodes stay in backticks only.
- **ALWAYS give FULL parameters** for every node (Method, URL, Auth, Headers, Body/JSON, Options, field names/types, exact expressions). No shortcuts, no “same as X”, no partial tables.
- **ALWAYS use exact canvas node names.** Never invent labels like “HTTP Request — poll”, “Kling result HTTP”, or “the result node”. Live canvas (do not rename): `if_complaince`, `ai_vid_generator`, `Wait2`, `Wait`, `Wait3`, `fal_lipsync_call`, `pep_lip_sync_result`. There is **no** `save_tts_audio_url`. If you are proposing a new node, give the exact `lower_case_with_underscores` name in that same message and use only that name afterward.
- **Define n8n UI terms on first use** (e.g. **pin** = n8n “Pin data”: freeze a node’s last output so Test workflow skips that node and does not bill another API call).
- Keep `vid_gen_landscape_scenes` separate from the original workflow
- Keep `vid_gen_palm_beach_pep` separate from other video workflows
- **#1 PRIORITY — Pep character lock:** Pep must match master `https://files.catbox.moe/2yfdbi.jpg` exactly every still. Use `/v1/images/edits` + `<IMAGE_0>` master. Never `/generations` for Pep. QC still vs master before video. See `marketing/n8n-pep-character-lock.md` and `marketing/n8n-pep-grok-still-body-lock.txt`
- Pep plan: `marketing/n8n-vid-gen-palm-beach-pep-weekly-plan.md`
- Pep execute guide: `marketing/n8n-vid-gen-palm-beach-pep-execute.md`
- Pep character lock: `marketing/n8n-pep-character-lock.md`
- Pep video stack: `marketing/n8n-pep-elevenlabs-video.md` (ElevenLabs cartoon intent → fal Kling I2V + ElevenLabs TTS; keep exact node names)
- Pep fal + Kling setup: `marketing/n8n-pep-fal-kling-setup.md`
- Pep lip-sync now: `marketing/n8n-pep-lipsync-setup.md`
- **One workflow:** still → `ai_vid_generator` → `fal_lipsync_call` → `pep_lip_sync_result` → sheets. Do **not** rename lipsync. Do **not** wire `kling_video_request` — that name is not the live POST. Canvas has **no** `save_tts_audio_url`; audio is `fal_upload_tts_initiate.file_url`. Pep video is **fal Kling**, not Luma.
- **Kling walk+talk lock:** Beat A I2V must look like Pep is **walking and talking the entire 15s**. Mouth on the 10ml label starts at 0.00s and never stops (lipsync needs that motion). A grin still makes Kling freeze the mouth until ~12s — still mouth must be a talking AH/OH, not a held smile. Legs keep a walk cycle the whole clip (stay mid-ground, do not walk out of frame). **Stitch:** first and last frame are mid-stride, same walk direction (toward camera, slight 3/4, screen-right). When the next beat still exists, send Kling `end_image_url` so the clip lands on the next shot. CapCut: 8–12 frame cross-dissolve at A→B, B→C, C→D (not fade-to-black). No thumbs-up, hat tip, or grin-hold. Paste `marketing/n8n-pep-prep-video-beat.js` into `prep_grok_video_start`. `cfg_scale` `0.8`. Re-run the still when it is planted / thumbs-up / a held grin. Paste `marketing/n8n-pep-grok-still-body-lock.txt` into `grok_imagine_reel_still`.

## Social / Imagine
- Aspect ratio for Pep + landscape social workflows: always **9:16**
- **WATCH — tell Sal immediately when new Imagine models hit the API**
  - **Imagine Image 2.0 API: LIVE (as of 2026-08-07)** — model id `grok-imagine-image-2.0` · $0.04/image · docs: https://docs.x.ai/docs/models · announce: https://x.ai/news/grok-imagine-image-2
  - Still watch: edits multi-ref / Quality Mode parity in n8n HTTP, and any **Imagine Video 2.0** API id
  - When checking: xAI models page + `/v1/images/generations` + `/v1/images/edits` model list
  - Candidate swap for vial / lab / landscape stills: try `grok-imagine-image-2.0` vs current `grok-imagine-image` / `grok-imagine-image-quality`
  - Pep stills stay on EDIT + master lock until 2.0 edit path is QC’d against Pep master
