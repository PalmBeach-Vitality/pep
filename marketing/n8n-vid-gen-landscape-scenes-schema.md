# vid_gen_landscape_scenes — spreadsheet schema (save for node build)

**Workflow:** `vid_gen_landscape_scenes`  
**Sheet tab:** `9-lab-item-creations-500` (also mirrored as `4-vid-gen-landscape-scenes-500`)  
**Source creative list:** `500_Peptide_Wellness_Reel_Scenes` (ID / Scene Description / Vibe / Theme)

## Canonical columns (exact order)

| Column | Purpose |
|---|---|
| `scene_id` | Unique scene key (e.g. `LI-001`) |
| `workflow` | Always `vid_gen_landscape_scenes` |
| `aspect` | `16:9` |
| `scene_category` | `lab_scene` \| `vial_10ml_scene` \| `pen_3ml_scene` |
| `scene_name` | Human label |
| `set_environment` | Environment / set description |
| `camera` | Camera / framing notes |
| `lighting` | Lighting / mood |
| `product_hero` | How the product appears in frame |
| `product_form_detail` | `10mL…` / `3mL…` / blank for lab_scene |
| `compound_id` | Product lock for captions |
| `compound_name` | Display name |
| `canonical_url` | Catalog URL |
| `scene_brief` | Full Imagine / video prompt brief |
| `caption_lock` | Hard caption product lock text |
| `status` | `Active` / `Paused` |
| `rotation_order` | 1…500 |
| `last_used_date` | YYYY-MM-DD after successful run |
| `source_id` | Original wellness CSV ID |
| `vibe` | Cool / Dramatic / Fun / Funny |
| `theme` | Original theme tag |

## n8n pick chain (when building nodes)

```text
sheets (9-lab-item-creations-500)
  → filter_active (status=Active)
  → sort_rotation (last_used_date ASC, rotation_order ASC)
  → Limit 1
  → prep_day_variant (map scene_* + compound_* + set_environment)
  → …
```

## Comparison notes (Wellness source vs this sheet)

| Wellness source col | Maps to |
|---|---|
| `ID` | `source_id` + `scene_id` (`LI-###`) |
| `Scene Description (Pure Visual + Motion)` | core of `scene_brief` + `set_environment` (first clause) |
| `Vibe` | `vibe` + influences `lighting` |
| `Theme` | `theme` + part of `scene_name` |

Added for 9-lab-item quality / n8n: product locks, vial/pen specs, caption_lock, rotation fields, workflow, aspect.
