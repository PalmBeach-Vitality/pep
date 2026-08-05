# vid_gen_landscape_scenes — spreadsheet schema (for node builds)

**Workflow:** `vid_gen_landscape_scenes`  
**Sheet / CSV:** `9-lab-item-creations-500`  
**Aligned to:** original `9-lab-item-creations-500` column style  
**Omitted on purpose:** `lab_item`, `lab_item_id` (not used for this landscape workflow)

## Canonical columns

| Column | Notes |
|---|---|
| `creation_id` | Unique id (`LI-001` …) — use like old `scene_id` |
| `rank` | Rotation rank 1…500 |
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
| `aspect_ratio` | `16:9` |
| `duration_seconds` | `8` |
| `resolution` | Video resolution `720p` |
| `model_still` | `grok-imagine-image-quality` |
| `model_video` | `grok-imagine-video-1.5` |
| `still_resolution` | `2k` |
| `video_prompt` | Image-to-video prompt |
| `video_motion_prompt` | Motion-only prompt |
| `status` | `Active` / `Paused` |
| `times_used` | Starts at `0` |
| `last_used_at` | Fill on writeback |
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
sheets (9-lab-item-creations-500)
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
