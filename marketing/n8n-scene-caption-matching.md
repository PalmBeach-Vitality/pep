# Scene library + matching captions (image-only)

## Sheet
**File / tab:** `3-image-lab-scenes-150` (also mirrored as `3-image-scenes-150.csv`)  
**Rows:** **300** Active  
**Document ID (same workbook as other PB sheets when used):** `1S6UQmD4ZFW3oL4vx8BKmhWAZrt7KMGwsBS7jW3S9HPo`

| scene_category | Count | Notes |
|---|---:|---|
| `lab_scene` | 100 | Full lab wide |
| `vial_10ml_scene` | 100 | Full lab + 10mL sterile crimp vial |
| `pen_3ml_scene` | 100 | Full lab + 3mL dosage pen |

## Rotation rules
- Sort: `last_used_date` ASC (empties first), then `rotation_order` ASC
- Unused rows are staggered: **lab → vial → pen → …** with **different `compound_id` on adjacent ranks**
- Every `scene_brief` is unique
- **Used rows LAB-001…LAB-013** keep their compound + scene_brief + `last_used_date` and sit at the end of the queue so they do **not** repeat until all other rows have been used

## Date note
LAB-001…LAB-013 dates were set to 2026-07-27 … 2026-08-08 to match sheet rows 2–14 usage order.  
**After import, overwrite those `last_used_date` cells with your real Google Sheet dates if they differ** — keep them on the same `scene_id` / compound / scene_brief.

## n8n pick chain
```text
Sheets (3-image-lab-scenes-150)
  → filter_active
  → sort_rotation (last_used_date ASC, rotation_order ASC)
  → Limit 1
```
