# Palm Beach Pep — n8n MCP agent handoff

**Read this first.** Then `marketing/AGENT_RULEBOOK.md`. Canvas steps: `marketing/n8n-pep-60s-1080-execute.md`.

This file is the full lock for a **new Cloud Agent with n8n MCP on**. The previous Palm Beach Pep Cloud Agent (`bc-798ad8de-924a-4da6-904a-3ee3007a8510`) **cannot** attach n8n. n8n is not an environment setting. Enable n8n in that new agent’s **MCP dropdown** before the first message.

You are helping **Salvatore (Sal)**, Designer at Palm Beach Vitality. Fewest steps. Exact canvas names. Full node params only for nodes he must change. Do not invent extra n8n nodes, tabs, pins, or Test workflow runs.

---

## Repo / branch / workflow

| Item | Value |
|---|---|
| Repo | `PalmBeach-Vitality/pep` |
| Branch | `cursor/palm-beach-pep-scenes-8510` |
| PR | https://github.com/PalmBeach-Vitality/pep/pull/10 |
| Workflow (keep separate) | `vid_gen_palm_beach_pep` |
| Do **not** merge into | `vid_gen_landscape_scenes`, vial/lab, `custom_vid_gen1.5-idea-to-video-pbv-log` |
| Aspect | **9:16** always |
| Cadence | **20 unique 30s clips to start.** One talking clip per Test workflow. |

**Product:** Palm Beach Pep = anthropomorphic **10mL crimp-seal glass vial** mascot.

**Master (locked):** `https://files.catbox.moe/2yfdbi.jpg`  
Repo backup: `marketing/assets/palm-beach-pep-master.jpg`  
n8n field `pep_ref_url` on `Prep_day_variant`.

Stills: Grok **EDIT only** `POST https://api.x.ai/v1/images/edits`. **Never** `/generations` for Pep.

---

## What is current vs stale

**Current (obey these):**

- This handoff
- `marketing/AGENT_RULEBOOK.md`
- `marketing/n8n-pep-60s-1080-execute.md`
- `marketing/n8n-pep-prep-beats.js` (1 beat, move-and-talk: walk / jog / dance / hike / sport)
- `marketing/n8n-pep-split-beats.js` (1 item)
- `marketing/n8n-pep-gather-clips.js` (plain Code, 1 clip)
- `marketing/n8n-pep-prep-lipsync.js`
- `marketing/n8n-pep-grok-still-body-lock.txt`
- `marketing/n8n-pep-tts-body.txt`
- `marketing/n8n-pep-character-lock.md` (eyes / 10ml / master)
- `marketing/n8n-pep-pronunciation.md`

**Stale in places (do not follow 2-cut / 50s 720p talking):**

- `marketing/n8n-vid-gen-palm-beach-pep-weekly-plan.md` still says **two** ~30s cuts
- Parts of `marketing/n8n-vid-gen-palm-beach-pep-execute.md` still say 2 `beat_items` / 50s talking
- `marketing/n8n-pep-save-outputs.txt` still mentions Kling `video_url` / 4 beats

Locked talking path is **one ~30s 1080p OmniHuman clip**. Loop stays on the canvas. Split emits **1 item**. Loop runs once, then `done`. Tab `150-pb-pep-scenes` still has that name; it now holds **20 rows**.

---

## Locked talking path (exact canvas names)

Do **not** rename. Spelling `if_complaince` is **intentional**. There is **no** `save_tts_audio_url`.

```text
get_rows_in_sheet → filter_active → sort_rotation → Limit → Prep_day_variant
→ grok_api → parse_grok → if_complaince
     false → stop
     true  → prep_pep_beats
           → split_pep_beats
           → loop_pep_beats          Batch Size 1, Reset OFF
                loop → tts_pep_voice_over
                     → fal_upload_tts_initiate
                     → merge_tts_binary
                     → fal_upload_tts_put
                     → grok_imagine_reel_still
                     → save_still_url
                     → prep_pep_lipsync
                     → pep_lipsync_fal
                     → save_lipsync_video_url
                     → back into loop_pep_beats
                done → gather_pep_clips
                     → sheets_update_creation
```

`Schedule Trigger` → `get_blocking_pool` is a **dead-end side branch**. Do **not** insert it on the talking path. `prep_pep_beats` reads `$('get_blocking_pool').all()` when that node exists.

**Kling walk chain — leave on canvas, disconnected:**

```text
prep_grok_video_start → ai_vid_generator → Wait2 → Wait → grok_video_poll → kling_video_result → save_video_url
```

Also leave disconnected (do not delete/rename): `fal_lipsync_call` → `Wait3` → `pep_lipsync_poll` → `pep_lip_sync_result`, and `kling_video_request`.

Talking clip is **OmniHuman**, not Kling. Do **not** wire Kling into the talking path.

---

## n8n MCP (this is why you exist)

- Cloud Agents pick MCP from the **MCP dropdown on cursor.com/agents**, at start / on the follow-up composer.
- MCP is **not** the Cloud Agent environment (VM / install / secrets / snapshot).
- You cannot add n8n to an already-running agent via environment.json.
- HTTP MCP is preferred. n8n instance-level MCP URL shape: `https://<n8n-domain>/mcp-server/http`.
- If you have n8n tools: use them to inspect/edit `vid_gen_palm_beach_pep`. Still follow least-actions: change only the node Sal needs. Paste from repo files rather than rewriting JS in chat.
- If n8n MCP is missing, tell Sal to enable n8n in **this** agent’s MCP dropdown, then send another message. Do not ask him to paste unless MCP is actually down.

---

## Sheets

Do **not** create, rename, overwrite, or modify any spreadsheet unless Sal names it by **exact name**.

| Tab | Role |
|---|---|
| `150-pb-pep-scenes` | 150 unique scenes. Spoken lines = column `voice_over` **only**. Rotation: `times_used` ASC, `last_used_at` ASC. Writeback: `sheets_update_creation`. |
| `pep-blocking-pool` | Body / gesture / angle pool. Side branch `get_blocking_pool`. |

CSV in repo:

- Blob: https://github.com/PalmBeach-Vitality/pep/blob/cursor/palm-beach-pep-scenes-8510/marketing/sheets/150-pb-pep-scenes.csv
- Raw: https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/sheets/150-pb-pep-scenes.csv
- Blocking blob: https://github.com/PalmBeach-Vitality/pep/blob/cursor/palm-beach-pep-scenes-8510/marketing/sheets/pep-blocking-pool.csv
- Blocking raw: https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/sheets/pep-blocking-pool.csv

**Every CSV update must include blob + raw links in the same reply.**

### Columns removed (Sal must drop on live sheet if still present)

- `pep_script` — unused old “lab only / not for people” copy. Never spoken.
- `disclaimer_short` — unused. Spoken VO is `voice_over` only. Caption research-use stays on `caption_lock`.

Also delete matching fields on `Prep_day_variant` if they still exist.

`Prep_day_variant`: **Include Other Input Fields ON**. Must pass `voice_over` through. Missing `voice_over` was a real fail.

### Scene briefs (20 rows)

`Palm Beach Pep walks|jogs|dances|hikes|pedals|boxes|trains` mid-ground + unique `surface`. Action in `scene_brief`. Standing / sitting / stopping / turning are **inactive**.

`prep_pep_beats` body pick:

| Scene verb | `pep_body_action` | OmniHuman |
|---|---|---|
| walks | `walking` | **WALK AND TALK** the whole clip |
| jogs | `running` | **JOG AND TALK** |
| dances | `dancing` | **DANCE AND TALK** (planted sneakers) |
| hikes | `hiking` | **HIKE AND TALK** |
| pedals / boxes / trains | `sports_ready` | **SPORT MOTION AND TALK** |
| stands / sits / stops / turns | **`walking`** (freeze remapped) | **WALK AND TALK** |
| unmatched | `walking` | walk and talk |

Walk / jog / hike gloves = `walk_swing`. Dance = `dance_groove`. Sport = `sport_guard`. No pointing / counting / waving (those made OmniHuman arms weird).

---

## Spoken VO (locked)

Spoken lines come **only** from `150-pb-pep-scenes.voice_over`. **20 unique clips.** Easy science, hook first:

1. Hook + Pep intro + how **this** peptide works
2. Required: `Studies have shown X has been beneficial to X in recent research studies.`
3. Immediately before last sentence: `Palm Beach Vitality research peptides are backed by a COA with every single order, American made delivering >99% purity 100% of the time.`
4. Last sentence exactly: `Visit us at palmbeach-vitality.store.`

Word count **65–74** (~26–29.5s at ~2.51 wps). OmniHuman **1080p** audio cap is **30s**. Longer audio 422s at 1080p.

Sal reviews scripts in `marketing/n8n-pep-20-vo-review.md` before treating them as final.

Builder: `marketing/scripts/build_20_pep_scenes.py`.

**Never speak:** FDA, unique-set, laboratory-research-use-only, not for human use. Those stay on **captions** (`caption_lock` / `grok_api`).

Captions keep chemical names. ElevenLabs speaks `tts_speak` (pronunciation map in `prep_pep_beats`). Table: `marketing/n8n-pep-pronunciation.md`.

Critical spoken map:

- Semaglutide = **SEM-uh-GLOO-tide** (stress on GLOO)
- COA = **certificate of analysis**
- `>99%` = **greater than ninety-nine percent**

TTS JSON Body is the **entire** field:

https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/n8n-pep-tts-body.txt

Must start `={{ JSON.stringify({`. Do **not** wrap in another `{ }`. A leftover `={{` inside a JSON object caused `Unexpected token '='`.

Builder: `marketing/scripts/build_20_pep_scenes.py` (live 20×30s). `marketing/scripts/build_pep_minute_pitches.py` is the old 150-row 50s builder.

---

## Character / still / OmniHuman QC

### Character (#1 priority)

Pep must match master every still. Zero redesign.

- Clear 10ml glass vial, rubber stopper + **silver aluminum crimp** (NOT screw-cap, NOT black twist cap)
- White label: two cartoon oval eyes, **same lash state as master from frame one** (master currently has **none**)
- Bold type exactly **`10ml`** (four characters: 1, 0, m, l). **HARD FAIL `10mlz`** or any fifth glyph
- White baseball cap, Palm Beach Vitality sunset + palm tree. **“Palm Beach” is branding, not the location.**
- Gray tube limbs, white gloves, rounded white sneakers
- Mouth **open mid-word** (OmniHuman start). Not a wide held grin. Not master thumbs-up.

### Set lock

Background = that row’s `surface`. Do **not** default to beach/shore unless `surface` is beach/sand/shore/ocean. Boardwalk ≠ generic beach. That was a real miss.

### Feet / hover

Both sneakers on the set with contact shadows. **HARD FAIL:** hovering, floating, sneakers in mid-air, walking on air.

Walk still = **mid-stride**, one sneaker forward, **both still touching ground**, hip-height walk swing.

### Eyes / lashes

Same two cartoon ovals. Eyes **should blink and glance** in the mp4. That is good.

Lashes: OK if they exist from 1s matching the still, or absent the whole clip. **HARD FAIL mid-clip lash grow-in.**

If the still is clean and the mp4 grows lashes or warps eyes → remint **`pep_lipsync_fal` only**. Do not remint Grok.

### OmniHuman

- Model: `fal-ai/bytedance/omnihuman/v1.5` on `pep_lipsync_fal`
- Image: `={{ $('save_still_url').item.json.reel_still_url }}` (xAI URL, not Catbox)
- Audio: `={{ $('fal_upload_tts_initiate').item.json.file_url }}` (not Catbox; fal cannot fetch `files.catbox.moe`)
- Resolution: **`1080p`** (VO must stay ≤30s)
- Prompt: `={{ String($('prep_pep_lipsync').item.json.omnihuman_prompt) }}` — a JS **string**. Do **not** use `$json.omnihuman_prompt` (undefined on this fal node)
- Exactly **4** parameters. No fifth. Do not send `video_url` (that is sync-3 / Kling lipsync)
- Wait for Completion **ON**. Poll **5s**. Max Wait **`1200`**
- Motion prompts must say **WALK / JOG / DANCE / HIKE / SPORT AND TALK**. Do not “hold the still pose”. Stay mid-ground. Do not walk out of frame. Each step plants. Dance/sport sneakers stay planted.
- Cost: **$0.16 / second** ≈ **$4.80 per 30s 1080p clip**. Stills are ~$0.05–$0.10. Do not remint a published pass.

fal usage charts default **UTC**. Eastern in August is EDT (UTC−4). No account timezone setting.

---

## Pin (n8n Pin data)

**Pin** = freeze that node’s last OUTPUT so Test workflow skips the API call (no new bill). Thumbtack on the **canvas OUTPUT**, not Executions.

Load an old run: Executions → successful run → **Debug in editor** / Copy to editor → then pin on canvas.

Saving params is free. **Test workflow / Execute bills.** Do not Test just to save.

### Unique weekly scene (production)

**NEVER PIN:** `grok_imagine_reel_still`, `tts_pep_voice_over`, `pep_lipsync_fal`

**UNPIN talking path:** `get_rows_in_sheet`, `filter_active`, `sort_rotation`, `Limit`, `Prep_day_variant`, `grok_api`, `parse_grok`, `if_complaince`, `get_blocking_pool`, `prep_pep_beats`, `split_pep_beats`, `tts_pep_voice_over`, `fal_upload_tts_initiate`, `merge_tts_binary`, `fal_upload_tts_put`, `grok_imagine_reel_still`, `save_still_url`, `prep_pep_lipsync`, `pep_lipsync_fal`, `save_lipsync_video_url`, `gather_pep_clips`, `sheets_update_creation`

**PIN (skip Kling bill):** `prep_grok_video_start`, `ai_vid_generator`, `Wait2`, `Wait`, `grok_video_poll`, `kling_video_result`, `save_video_url`

Unique backgrounds require `grok_imagine_reel_still` **unpinned**. Pinning a still reuses that exact JPEG (same Pep, same set).

### Retry OmniHuman on a good still (do not remint Grok)

PIN `grok_imagine_reel_still` + `save_still_url` (and TTS upload chain if audio is already good).  
UNPIN `pep_lipsync_fal` (+ `prep_pep_lipsync`, `save_lipsync_video_url` as needed).

Do **not** pin an old **standing** still into a **walk** clip.

---

## Node paste locks (select all, delete, paste)

Raw URLs (branch `cursor/palm-beach-pep-scenes-8510`):

| Node | Mode | File |
|---|---|---|
| `prep_pep_beats` | Run Once for Each Item. Do **not** `return [{ json }]` | https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/n8n-pep-prep-beats.js |
| `split_pep_beats` | Run Once for All Items. **Does** return `[{ json }]` | https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/n8n-pep-split-beats.js |
| `gather_pep_clips` | Run Once for All Items. First line `// Node: gather_pep_clips (Code)` | https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/n8n-pep-gather-clips.js |
| `prep_pep_lipsync` | Run Once for Each Item. Do **not** `return [{ json }]` | https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/n8n-pep-prep-lipsync.js |
| `merge_tts_binary` | Run Once for Each Item. Paired `$('tts_pep_voice_over').item` — not `.first()` | https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/n8n-pep-merge-tts-binary.js |
| `grok_imagine_reel_still` JSON Body fx ON | entire `={{ JSON.stringify({` block | https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/n8n-pep-grok-still-body-lock.txt |
| `tts_pep_voice_over` JSON Body fx ON | entire stringify | https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/n8n-pep-tts-body.txt |

**gather:** leftover old JS under a new paste caused `Identifier 'incoming' has already been declared` and `Invalid regular expression: missing /`. Fix is select **all**, delete, paste. Plain Code. No IIFE.

**prep_pep_beats:** leftover IIFE caused `}()` SyntaxError. Paste the raw file only.

### `save_still_url`

Include Other Input Fields **OFF**. **Only** field:

`reel_still_url` = `={{ $json.data[0].url }}`

### `save_lipsync_video_url`

Include Other Input Fields **OFF**.

| Field | Value |
|---|---|
| `lipsync_video_url` | `={{ $json.video.url }}` |
| `video_url` | `={{ $json.video.url }}` |
| `tts_audio_url` | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| `creation_id` | `={{ $('split_pep_beats').item.json.creation_id \|\| $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | `={{ $('split_pep_beats').item.json.beat }}` |
| `reel_still_url` | `={{ $('save_still_url').item.json.reel_still_url }}` |
| `model_video` | `fal-omnihuman-v1.5` |

### `sheets_update_creation`

Tab `150-pb-pep-scenes`. Match `creation_id`. Mapping: `marketing/n8n-pep-sheets-update.txt`.

| Column | Value |
|---|---|
| `last_used_at` | `={{ $now.toISO() }}` |
| `times_used` | `={{ Number($('Limit').item.json.times_used \|\| $('Prep_day_variant').item.json.times_used \|\| 0) + 1 }}` |
| `reel_still_url` | `={{ $('gather_pep_clips').item.json.reel_still_url }}` |
| `video_url` | `={{ $('gather_pep_clips').item.json.video_url }}` |
| `model_video` | `={{ $('gather_pep_clips').item.json.model_video \|\| 'fal-omnihuman-v1.5' }}` |

### `grok_imagine_reel_still`

- URL: `POST https://api.x.ai/v1/images/edits`
- Timeout: `300000`
- Body: lock file only (no `#` comments in the field)
- model: `grok-imagine-image` (Pep stays EDIT + master until Imagine Image 2.0 edit path is QC’d)
- Preview must show `image.url` = master, `image.type` = `image_url`, prompt starts `EDIT THIS IMAGE ONLY`

### `grok_api` / `parse_grok` / `if_complaince`

Captions + compliance **only**. Do not send talking-path still/VO through a false loop. If `if_complaince` loops false, captions/compliance JSON is wrong — do not “fix” by reminting OmniHuman.

`grok_api` body helper: `marketing/n8n-pep-grok-api-body.txt`  
`parse_grok`: `marketing/n8n-pep-parse-grok.js` — `compliance_ok` must be a real boolean.

### `pep_lipsync_fal` four params (copy)

| # | Parameter Name or ID (fx OFF) | Value fx | Value |
|---|---|---|---|
| 1 | **Image [string]** (`image_url`) | ON | `={{ $('save_still_url').item.json.reel_still_url }}` |
| 2 | **Audio [string]** (`audio_url`) | ON | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| 3 | **Resolution** (`resolution`) | OFF | `1080p` |
| 4 | **Prompt [string]** (`prompt`) | ON | `={{ String($('prep_pep_lipsync').item.json.omnihuman_prompt) }}` |

If n8n errors `No path back to node` on `$('save_still_url')`, fall back to `$json.lipsync_image_in` / `$json.lipsync_audio_in` from `prep_pep_lipsync`.

---

## How to talk to Sal (n8n UI)

- Prefer a predefined n8n node over HTTP. Search **+** for ElevenLabs, fal.ai, Google Sheets, xAI first. Catalog: `marketing/n8n-node-reference.md`
- New node names: `lower_case_with_underscores`
- When telling Sal to pin/unpin: **exact canvas names**. Never “pin TTS”.
- When adding a node: wrap the **new** name in parentheses: `(kling_video_result)`. Wire `before` → **`(new)`** → `after`. Existing nodes stay in backticks.
- Full parameters for every node he must change in that message. No “same as X”.
- Define n8n terms on first use (pin = Pin data).
- One node (or tight group) at a time.

Live names you must not invent replacements for: `if_complaince`, `ai_vid_generator`, `Wait2`, `Wait`, `Wait3`, `pep_lipsync_fal`, `pep_lip_sync_result`. Canvas has **no** `save_tts_audio_url`. TTS public URL = `$('fal_upload_tts_initiate').item.json.file_url`.

---

## Bugs Sal already hit (do not reintroduce)

1. Hovering Pep / thumbs-up still → planted-feet + not master freeze.
2. Weird OmniHuman arms → relaxed hips / walk swing only. No point/count/wave.
3. `if_complaince` looping false → captions-only grok/parse.
4. Missing `voice_over` → Prep Include Other Input Fields ON.
5. TTS `Unexpected token '='` → stringify-only body.
6. `prep_pep_beats` `}()` SyntaxError → leftover IIFE; paste raw file.
7. `gather_pep_clips` `Identifier 'incoming' has already been declared` → leftover old gather JS.
8. `gather_pep_clips` `Invalid regular expression: missing /` → leftover old JS / IIFE / slash in throw string. Plain Code now.
9. Generic beach instead of boardwalk → SET lock on `surface`.
10. Standing-still talking on the last 2 OmniHuman clips → walk-and-talk lock in `prep_pep_beats` (stand rows remap to walking). Needs a **new mid-stride still**. Do not reuse a standing still.
11. Mid-clip lash grow-in → still must match master lashes from frame one; remint OmniHuman only if still is good.
12. `10mlz` → discard still.

---

## Do not remint (published / pass)

**Boardwalk (2026-08-15) — PASS. Do not remint Grok or OmniHuman.**

- Still: `https://imgen.x.ai/xai-imgen/xai-tmp-imgen-cce5f5b2-265c-9932-911a-b5c99e071ed6-bb7d3fba.jpeg`
- Talking clip: `https://v3b.fal.media/files/b/0aa673c0/QJXLAo2E80avVgXRZv2pw_video.mp4` — **49.8s**, `10ml` held, boardwalk held, blinks without mid-clip lash grow-in, speech to the end.
- Confirm `sheets_update_creation` wrote this URL to that row’s `video_url` if not already.

**Forest PEP-019 (older, treat as publishable enough — do not chase remints unless Sal asks):**

- Still: `https://imgen.x.ai/xai-imgen/xai-tmp-imgen-acf05663-98d2-979f-b566-4422d1ad57c5-bb649ec0.jpeg`
- Video: `https://v3b.fal.media/files/b/0aa66471/DYEnhEHwuvDXj9I4QTfjS_video.mp4`

Next product run: UNPIN stills, mint a **motion** still for that row’s `surface` (walk / jog / dance / hike / sport), QC, then OmniHuman. One Test workflow = 1 still + 1 TTS + 1 OmniHuman **1080p**.

---

## Imagine model watch

Tell Sal immediately when new Imagine models hit the API.

- Imagine Image 2.0 API live (2026-08-07): `grok-imagine-image-2.0` · $0.04/image
- Pep stills stay on EDIT + current `grok-imagine-image` until 2.0 **edit** path is QC’d vs master
- Still watch: edits multi-ref / Quality Mode parity in n8n HTTP, Imagine Video 2.0 API id

---

## Tests

`node marketing/scripts/test_pep_60s_nodes.js` — syntax + contracts for one 30s 1080p talking clip (action bodies, 1080p, gather 1 clip, TTS `tts_speak`).
`python3 marketing/scripts/test_pep_60s_split.py` — 20 rows, 65–74 words, unique sets.

---

## File map

| File | Use |
|---|---|
| `marketing/AGENT_RULEBOOK.md` | Always-on Sal rules |
| `marketing/n8n-pep-60s-1080-execute.md` | Canvas paste order for the 30s 1080p path |
| `marketing/n8n-pep-lipsync-setup.md` | fal upload + OmniHuman node params |
| `marketing/n8n-pep-character-lock.md` | Master / edits / QC |
| `marketing/n8n-pep-pronunciation.md` | Spoken names |
| `marketing/n8n-pep-stitch-notes.md` | Do not dissolve A+B into one 60s film (legacy; current path is one clip) |
| `marketing/n8n-pep-omnihuman-keeper.txt` | Older keeper clip notes |
| `marketing/scripts/build_20_pep_scenes.py` | Rebuild the 20 VOs / sets / blocking pool |
| `marketing/n8n-pep-20-vo-review.md` | Sal’s VO review list |
| `marketing/n8n-node-reference.md` | Prefer official nodes over HTTP |

---

## First actions on a new n8n-MCP agent

1. Confirm n8n MCP tools are actually present.
2. Open workflow **`vid_gen_palm_beach_pep`**. Do not rename nodes.
3. If Sal has not pasted the 30s/1080p motion path yet: paste `prep_pep_beats`, grok still body lock, `prep_pep_lipsync`, `split_pep_beats`, `gather_pep_clips` (select all, delete, paste). Set `pep_lipsync_fal` Resolution to **`1080p`**.
4. UNPIN `grok_imagine_reel_still`, `save_still_url`, `tts_pep_voice_over`, `pep_lipsync_fal` for a new motion clip.
5. Do **not** remint the boardwalk pass.
6. QC still vs master before OmniHuman: `10ml`, no lashes unless on master, planted sneakers, motion pose matching the row, mouth open, correct `surface`.
7. One Test workflow when Sal is ready to spend ~$4.80.
