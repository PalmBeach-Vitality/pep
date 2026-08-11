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
- **When telling Sal to add a node, always show wire context:** `before_node` → **`new_node`** → `after_node`
- Keep `vid_gen_landscape_scenes` separate from the original workflow
- Keep `vid_gen_palm_beach_pep` separate from other video workflows
- **#1 PRIORITY — Pep character lock:** Pep must match master `https://files.catbox.moe/2yfdbi.jpg` exactly every still. Use `/v1/images/edits` + `<IMAGE_0>` master. Never `/generations` for Pep. QC still vs master before video. See `marketing/n8n-pep-character-lock.md` and `marketing/n8n-pep-grok-still-body-lock.txt`
- Pep plan: `marketing/n8n-vid-gen-palm-beach-pep-weekly-plan.md`
- Pep execute guide: `marketing/n8n-vid-gen-palm-beach-pep-execute.md`
- Pep character lock: `marketing/n8n-pep-character-lock.md`
- Pep video stack: `marketing/n8n-pep-elevenlabs-video.md` (ElevenLabs cartoon intent → fal Kling I2V + ElevenLabs TTS; keep exact node names)
- Pep fal + Kling setup: `marketing/n8n-pep-fal-kling-setup.md`
- Pep lip-sync now: `marketing/n8n-pep-lipsync-setup.md`

## Social / Imagine
- Aspect ratio for Pep + landscape social workflows: always **9:16**
