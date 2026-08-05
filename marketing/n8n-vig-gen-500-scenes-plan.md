# vid_gen_landscape_scenes — node build plan

**Workflow (n8n):** `vid_gen_landscape_scenes`  
**Google Sheets document ID:** `1S6UQmD4ZFW3oL4vx8BKmhWAZrt7KMGwsBS7jW3S9HPo`  
**Sheet tab:** `500_peptide_wellness_reel_scenes`  
**CSV:** `marketing/sheets/500_peptide_wellness_reel_scenes.csv`  
**Schema:** `marketing/n8n-vid-gen-landscape-scenes-schema.md`

**HARD RULE:** Do not touch any spreadsheet unless Sal names it by **exact name**.  
`9-lab-item-creations-500` = reference only.

**HARD RULE:** After any file update Sal needs, always paste the **hard GitHub link** in the same reply.  
See `marketing/AGENT_RULEBOOK.md`.

**Rule:** Do **not** change the original image/vig workflow. Build only inside `vid_gen_landscape_scenes`.  
**New node names:** `lower_case_with_underscores`.

---

## Current sheet state

| | |
|---|---|
| Rows | **750** Active |
| Mix | `set_environment` 374 · `vial_10ml` 329 · `pen_3ml` 47 |
| Rank order | **Staggered** product ↔ environment (vial/pen → landscape → …) |
| Aspect | **9:16** |
| Key id | `creation_id` (use like old `scene_id`) |
| Rotation cols | `last_used_at`, `times_used`, `rank` |
| `workflow` col | `vid_gen_landscape_scenes` |

---

## Target chain (build in this order)

```text
manual_trigger
  → pull_sheets                (500_peptide_wellness_reel_scenes)
  → filter_active
  → sort_rotation
  → limit_one
  → prep_scene
  → edit_fields
  → grok_api
  → parse_grok
  → if_compliance
  → get_reel_creations         ⚠ must NOT re-pick a different scene
  → filter_creations_active
  → pick_creation
  → grok_imagine_reel_still_url
  → prep_grok_video_start
  → wait_video
  → grok_video_poll
  → save_video_url
  → sheets_update_creation
```

**Critical:** Caption was locked to `limit_one` / `prep_scene` (`creation_id`).  
Image/video nodes must use **that same row** — do not independently rotate a second creation.

If your duplicate already has some of these under different names, we **rename or rewire in place** — we do not rebuild the original workflow.

---

## Phase A — Pick one staggered row (START HERE)

**Goal:** Manual run returns exactly 1 Active row; next run flips product ↔ landscape via rank/writeback.

| Step | Node | Exact settings |
|---|---|---|
| A1 | `pull_sheets` | Document ID: **`1S6UQmD4ZFW3oL4vx8BKmhWAZrt7KMGwsBS7jW3S9HPo`** · Sheet: **`500_peptide_wellness_reel_scenes`** · return all rows |
| A2 | `filter_active` | Keep rows where `status` = `Active` |
| A3 | `sort_rotation` | Sort 1: `last_used_at` ASC (empties first) · Sort 2: `times_used` ASC · Sort 3: `rank` ASC |
| A4 | `limit_one` | Max items = **1** |

**Smoke A:** Execute through `limit_one`. Paste:
- `creation_id`
- `category` (expect product OR environment)
- `compound_id`
- `rank`

**Done when:** one row picks cleanly; original workflow untouched.

---

## Phase B — Prep → caption → image

| Step | Node | What it does |
|---|---|---|
| B1 | `prep_scene` | Map from Limit: `creation_id`, `category`, `material_detail`, `compound_id`, `compound_name`, `canonical_url`, `caption_lock`, `scene_brief`, `shot_family`, `aspect_ratio`, `still_resolution`, `video_prompt`, `video_motion_prompt`, `hero_style`, `lighting`, `camera_move`, `vibe`, `theme` |
| B2 | `edit_fields` | Build `system_prompt` + `user_prompt` (scene + `caption_lock`). Spec: `marketing/n8n-edit-fields-user-prompt-landscape.txt` |
| B3 | `grok_api` | Model `grok-4.5` (fallback `grok-4.3`), max_tokens 2000 · messages from `edit_fields` |
| B4 | `parse_grok` | Parse JSON captions; no hardcoded product URLs |
| B5 | `grok_imagine` | Still from `scene_brief` · aspect **9:16** · `resolution: 2k` · vial rules when `category=vial_10ml` · no caution/biohazard signage |
| B6 | `save_render_url` | Persist Imagine URL for Creatomate/Buffer |

**Smoke B:** Caption product = image product = scene `compound_id`. Category matches scene type (vial vs landscape).

---

## Phase C — Creatomate (later)

| Step | Node | Notes |
|---|---|---|
| C1 | `creatomate_render_landscape` | **New** template ID only — do not edit original Creatomate node/template |
| C2 | Field map | From `parse_grok` + `save_render_url` |

**Done when:** new template renders today’s copy + asset.

---

## Phase D — Buffer + writeback

| Step | Node | Notes |
|---|---|---|
| D1 | `buffer_post_ig` / `buffer_post_fb` | Post Creatomate (or Imagine) asset |
| D2 | `sheets_writeback` | Tab **`500_peptide_wellness_reel_scenes`** only · match `creation_id` · set `last_used_at` = now · `times_used` = +1 |

**Smoke D:** Run 2 picks a **different** `creation_id` and the **other** family (product ↔ environment).

---

## Hard rules

- Keep **separate** from original workflow  
- Full environmental scenes (no product close-ups) unless the row says otherwise  
- Vials = **10mL sterile crimp-seal** (no black twist caps)  
- No caution / biohazard / alert signage or alert words  
- Captions always match scene `compound_id`  
- New nodes: `lower_case_with_underscores`  
- Spreadsheet touch: **only** `500_peptide_wellness_reel_scenes` when Sal names it  

---

## Execution order (together)

| # | Phase | First node |
|---|---|---|
| 1 | **A** | `pull_sheets` |
| 2 | A | `filter_active` → `sort_rotation` → `limit_one` |
| 3 | B | `prep_scene` |
| 4 | B | `grok_http` → `grok_api` → `parse_grok` |
| 5 | B | `grok_imagine` → `save_render_url` |
| 6 | C | `creatomate_render_landscape` (later) |
| 7 | D | Buffer + `sheets_writeback` |

**We execute one node (or one tight group) at a time.** After each smoke, Sal pastes the key fields before we continue.
