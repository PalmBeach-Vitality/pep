# Agent rulebook (Sal / Palm Beach Vitality)

## Least actions
Always pick the **fewest steps that still work**. One sheet column or one node paste beats five remaps. Do not invent extra n8n changes, extra tabs, extra pins, or extra Test workflow runs. Full node params only for the node(s) Sal actually has to touch.

Time is limited. Treat Sal’s time as the scarce resource: shorter replies, fewer clicks, no optional busywork. If a step does not change the outcome, skip it.

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

Second Pep tab (blocking / pose pool, Sal-named):

`https://github.com/PalmBeach-Vitality/pep/blob/cursor/palm-beach-pep-scenes-8510/marketing/sheets/pep-blocking-pool.csv`

Spoken Pep lines come **only** from tab `150-pb-pep-scenes` column `voice_over`. Easy, upbeat, science-plus-wellness pitch. Intro + product + **Studies have shown X has been beneficial to X in recent research studies.** + close. **55–60 seconds** (142–150 words). Last sentence: **`Visit us at palmbeach-vitality.store.`** One talking clip. `pep_lipsync_fal` Resolution **`720p`** (1080p cannot take 55–60s audio). Never speak compliance/disclaimer. Captions still carry research-use framing.

Scene rotation columns on that same tab: `times_used`, `last_used_at`. `sort_rotation` is `times_used` ASC then `last_used_at` ASC. `sheets_update_creation` writes both.

## Always send hard links after file updates
Whenever you update a file Sal needs to download, import, or open, **immediately include the hard link** in the same reply.

Use the same blob URL form as above. Raw GitHub URLs are fine for direct download/import.

## n8n
- New node names: `lower_case_with_underscores`
- One node (or tight group) at a time, with exact node names
- **When telling Sal to pin or unpin, always list the exact canvas node names.** Never say “pin TTS” or “unpin video” without the names. Example: PIN `tts_pep_voice_over`, `fal_upload_tts_initiate`. UNPIN `pep_lipsync_fal`.
- **When telling Sal to add a node, always wrap the new node name in parentheses:** `(kling_video_result)`. Wire as `before_node` → **`(new_node)`** → `after_node`. Existing canvas nodes stay in backticks only.
- **ALWAYS give FULL parameters** for every node Sal must add or change in that message (Method, URL, Auth, Headers, Body/JSON, Options, field names/types, exact expressions). No shortcuts, no “same as X”, no partial tables. Do **not** dump params for nodes that already work and do not need a change.
- **ALWAYS use exact canvas node names.** Never invent labels like “HTTP Request — poll”, “Kling result HTTP”, or “the result node”. Live canvas (do not rename): `if_complaince`, `ai_vid_generator`, `Wait2`, `Wait`, `Wait3`, `pep_lipsync_fal`, `pep_lip_sync_result`. There is **no** `save_tts_audio_url`. If you are proposing a new node, give the exact `lower_case_with_underscores` name in that same message and use only that name afterward.
- **Define n8n UI terms on first use** (e.g. **pin** = n8n “Pin data”: freeze a node’s last output so Test workflow skips that node and does not bill another API call).
- Keep `vid_gen_landscape_scenes` separate from the original workflow
- Keep `vid_gen_palm_beach_pep` separate from other video workflows
- Sibling Grok Imagine idea-to-video canvas (reference only, do **not** merge into Pep): `custom_vid_gen1.5-idea-to-video-pbv-log` — `marketing/references/n8n-custom-vid-gen-from-other-agent.md`
- **#1 PRIORITY — Pep character lock:** Pep must match master `https://files.catbox.moe/2yfdbi.jpg` exactly every still. Use `/v1/images/edits` + `<IMAGE_0>` master. Never `/generations` for Pep. QC still vs master before video: same two cartoon eyes (**no eyelashes**), label type exactly `10ml` (discard `10mlz`). See `marketing/n8n-pep-character-lock.md` and `marketing/n8n-pep-grok-still-body-lock.txt`
- **SET LOCK:** Background is tab `150-pb-pep-scenes` column `surface` for that row. “Palm Beach” is the hat brand, not the location. Do not default to a shoreline unless `surface` is a shoreline.
- Pep plan: `marketing/n8n-vid-gen-palm-beach-pep-weekly-plan.md`
- Pep execute guide: `marketing/n8n-vid-gen-palm-beach-pep-execute.md`
- Pep character lock: `marketing/n8n-pep-character-lock.md`
- Pep video stack: `marketing/n8n-pep-elevenlabs-video.md` (ElevenLabs cartoon intent → fal Kling I2V + ElevenLabs TTS; keep exact node names)
- Pep fal + Kling setup: `marketing/n8n-pep-fal-kling-setup.md`
- Pep lip-sync now: `marketing/n8n-pep-lipsync-setup.md`
- **One workflow (talking path):** still → `prep_pep_lipsync` → `pep_lipsync_fal` (OmniHuman v1.5, **720p**, ~50–60s) → `save_lipsync_video_url` → `(gather_pep_clips)` → sheets. **One talking clip.** Standing Pep, sheet `voice_over`, no extra scene cuts. Do **not** rename lipsync. Do **not** wire `kling_video_request`. Canvas has **no** `save_tts_audio_url`; audio is `fal_upload_tts_initiate.file_url`. Canvas steps: `marketing/n8n-pep-60s-1080-execute.md`.
- **Talking recipe (locked):** Talking clip = **`pep_lipsync_fal`** OmniHuman v1.5. Dropdown: **Image [string]**, **Audio [string]**, **Resolution**, **Prompt [string]**. Prompt Value fx ON is `={{ String($('prep_pep_lipsync').item.json.omnihuman_prompt) }}` (a JS string). Do **not** use `$json.omnihuman_prompt` (undefined). Max Wait **`1200`**. Random Pep blocking comes from tab `pep-blocking-pool` via `(get_blocking_pool)` into `prep_pep_beats`.

## Social / Imagine
- Aspect ratio for Pep + landscape social workflows: always **9:16**
- **WATCH — tell Sal immediately when new Imagine models hit the API**
  - **Imagine Image 2.0 API: LIVE (as of 2026-08-07)** — model id `grok-imagine-image-2.0` · $0.04/image · docs: https://docs.x.ai/docs/models · announce: https://x.ai/news/grok-imagine-image-2
  - Still watch: edits multi-ref / Quality Mode parity in n8n HTTP, and any **Imagine Video 2.0** API id
  - When checking: xAI models page + `/v1/images/generations` + `/v1/images/edits` model list
  - Candidate swap for vial / lab / landscape stills: try `grok-imagine-image-2.0` vs current `grok-imagine-image` / `grok-imagine-image-quality`
  - Pep stills stay on EDIT + master lock until 2.0 edit path is QC’d against Pep master
