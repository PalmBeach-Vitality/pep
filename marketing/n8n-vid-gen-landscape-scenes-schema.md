# vid_gen_landscape_scenes — spreadsheet schema (for node builds)

## HARD RULE — spreadsheets
**Do not create, rename, overwrite, import instructions for, or modify any spreadsheet unless Sal names that sheet by its exact name in the request.**  
Reference-only mentions (e.g. column style of `9-lab-item-creations-500`) do **not** grant permission to touch that sheet.

**Workflow:** `vid_gen_landscape_scenes`  
**Google Sheets document ID:** `1S6UQmD4ZFW3oL4vx8BKmhWAZrt7KMGwsBS7jW3S9HPo`  
**Sheet / CSV:** `500_peptide_wellness_reel_scenes`  
**Column style aligned to:** `9-lab-item-creations-500` (reference only — never modify unless Sal names it exactly)  
**Omitted on purpose:** `lab_item`, `lab_item_id` (not used for this landscape workflow)

## Canonical columns

| Column | Notes |
|---|---|
| `creation_id` | Unique id (`LI-001` …) — use like old `scene_id` |
| `rank` | Rotation rank 1…750; **staggered** product (`vial_10ml`/`pen_3ml`) ↔ `set_environment` so `sort_rotation` + Limit 1 alternates vial/landscape each run |
| `category` | `set_environment` \| `vial_10ml` \| `pen_3ml` |
| `material_detail` | Vial/pen material spec (blank for set_environment) |
| `compound_id` | Product lock (**added** for n8n captions) |
| `compound_name` | Product name |
| `canonical_url` | Catalog URL (**added** for n8n captions) |
| `caption_lock` | Hard caption lock (**added** for n8n) |
| `shot_family` | `environment_landscape` / `vial_landscape` / `pen_landscape` |
| `camera_angle` | eye-level, low-angle, etc. |
| `camera_direction` | front, front-left, etc. |
| `framing` | 16:9 environmental framing notes |
| `scene_brief` | Full still/scene brief |
| `quality_var_count` | Default `1` |
| `quality_suffix` | From vibe |
| `aspect_ratio` | `9:16` (always — social vertical) |
| `duration_seconds` | `15` (social reel length) |
| `resolution` | Video resolution `720p` |
| `model_still` | `grok-imagine-image-quality` |
| `model_video` | `grok-imagine-video-1.5` |
| `still_resolution` | `2k` |
| `video_prompt` | Image-to-video prompt |
| `video_motion_prompt` | Motion-only prompt |
| `status` | `Active` / `Paused` |
| `times_used` | Starts at `0` |
| `last_used_at` | Fill on writeback |
| `reel_still_url` | Writeback from Imagine still |
| `video_url` | Writeback from completed reel video |
| `surface` | Set / surface cue |
| `lighting` | Lighting cue |
| `camera_move` | Push-in / slide / orbit, etc. |
| `color_grade` | Grade from vibe |
| `hero_style` | How product appears |
| `source_id` | Original wellness CSV ID |
| `vibe` | Cool / Dramatic / Fun / Funny |
| `theme` | Original theme |
| `workflow` | `vid_gen_landscape_scenes` |

## n8n pick chain (when building nodes)

```text
pull_sheets
  documentId: 1S6UQmD4ZFW3oL4vx8BKmhWAZrt7KMGwsBS7jW3S9HPo
  sheet: 500_peptide_wellness_reel_scenes
  → filter_active (status = Active)
  → sort_rotation (last_used_at ASC / times_used ASC, then rank ASC)
  → Limit 1
  → prep maps: creation_id, scene_brief, compound_*, video_*, camera_*, lighting, hero_style
```

## Mapping from wellness source

| Wellness col | Goes to |
|---|---|
| `ID` | `source_id`, `creation_id`, `rank` |
| `Scene Description…` | `scene_brief`, `video_prompt`, `surface` |
| `Vibe` | `vibe`, `lighting`, `color_grade`, `quality_suffix` |
| `Theme` | `theme` |
