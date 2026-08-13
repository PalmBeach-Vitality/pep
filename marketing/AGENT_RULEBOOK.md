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
- **When telling Sal to pin or unpin, always list the exact canvas node names.** Never say “pin TTS” or “unpin video” without the names. Example: PIN `tts_pep_voice_over`, `fal_upload_tts_initiate`. UNPIN `pep_lipsync_fal`.
- **When telling Sal to add a node, always wrap the new node name in parentheses:** `(kling_video_result)`. Wire as `before_node` → **`(new_node)`** → `after_node`. Existing canvas nodes stay in backticks only.
- **ALWAYS give FULL parameters** for every node (Method, URL, Auth, Headers, Body/JSON, Options, field names/types, exact expressions). No shortcuts, no “same as X”, no partial tables.
- **ALWAYS use exact canvas node names.** Never invent labels like “HTTP Request — poll”, “Kling result HTTP”, or “the result node”. Live canvas (do not rename): `if_complaince`, `ai_vid_generator`, `Wait2`, `Wait`, `Wait3`, `pep_lipsync_fal`, `pep_lip_sync_result`. There is **no** `save_tts_audio_url`. If you are proposing a new node, give the exact `lower_case_with_underscores` name in that same message and use only that name afterward.
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
- **One workflow:** still → `ai_vid_generator` (Kling walk) → `pep_lipsync_fal` (sync-3 mouth) → sheets. Do **not** rename lipsync. Do **not** wire `kling_video_request`. Canvas has **no** `save_tts_audio_url`; audio is `fal_upload_tts_initiate.file_url`.
- **Kling recipe (locked):** Leave Kling I2V as the walk clip. Do not rerun Kling to make the mouth talk. Mouth = **`pep_lipsync_fal`** (fal community node, sync-3 Lipsync video-to-video) + ElevenLabs TTS at `fal_upload_tts_initiate.file_url`. Wait for Completion ON. Parameters: `video_url` + `audio_url` + `sync_mode` `cut_off`.

## Social / Imagine
- Aspect ratio for Pep + landscape social workflows: always **9:16**
- **WATCH — tell Sal immediately when new Imagine models hit the API**
  - **Imagine Image 2.0 API: LIVE (as of 2026-08-07)** — model id `grok-imagine-image-2.0` · $0.04/image · docs: https://docs.x.ai/docs/models · announce: https://x.ai/news/grok-imagine-image-2
  - Still watch: edits multi-ref / Quality Mode parity in n8n HTTP, and any **Imagine Video 2.0** API id
  - When checking: xAI models page + `/v1/images/generations` + `/v1/images/edits` model list
  - Candidate swap for vial / lab / landscape stills: try `grok-imagine-image-2.0` vs current `grok-imagine-image` / `grok-imagine-image-quality`
  - Pep stills stay on EDIT + master lock until 2.0 edit path is QC’d against Pep master
