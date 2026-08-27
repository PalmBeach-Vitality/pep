# Google Sheets import

## Video + image scene files (import these)

Sal imports with **File → Import → Upload → Replace current sheet**. Do not create a new spreadsheet. Format the `aspect_ratio` column as **Plain text** before or immediately after import so `9:16` does not become 9:16 AM.

| File | Live spreadsheet | Tab |
|---|---|---|
| `3-image-scenes-150.csv` | [3-image-scenes-150](https://docs.google.com/spreadsheets/d/1O7jqmmq8ysf41QzquHuhHxTIJPW47kgBCXyA37z3FLs) | `3-image-scenes-150` |
| `3-image-lab-scenes-150.csv` | same workbook if you keep a lab-only tab | `3-image-lab-scenes-150` |
| `9-lab-item-creations-500.csv` | [9-lab-item-creations-500](https://docs.google.com/spreadsheets/d/1dvY7XGwjdkQm2Sp7glAvxuSLg9RHrxJd9tXbhh74Xfc) | `9-lab-item-creations-500` |
| `500_Peptide_Wellness_Reel_Scenes.csv` | [500_Peptide_Wellness_Reel_Scenes](https://docs.google.com/spreadsheets/d/1S6UQmD4ZFW3oL4vx8BKmhWAZrt7KMGwsBS7jW3S9HPo) | `500_Peptide_Wellness_Reel_Scenes` |

What these video CSVs change:
- **Unique `camera_move` and unique `video_motion_prompt` on every row** (no cloned “slow push-in; preserve product identity…” lines)
- Vial sticker copy is peptide name + `10ml` only (no milligram / per-milliliter marks)
- `aspect_ratio` is text `9:16` (not a time serial)
- Video params stay on the sheet so n8n does not invent them

---

# Spotlight compound queues (FDA-cleaned)

## Files
| File | Tab name to use |
|---|---|
| `1-compounds-pens.csv` | `1-compounds-pens` |
| `1-compounds-vials.csv` | `1-compounds-vials` |
| `2-product-page-mapping-pens.csv` | `2-product-page-mapping-pens` |
| `2-product-page-mapping-vials.csv` | `2-product-page-mapping-vials` |

## What changed (FDA-aligned)
- Chemical / peptide names only (no KLOW, Wolverine, GLOW nicknames)
- Categories reframed as research classes (no “healing/wellness” framing)
- Taglines/themes = laboratory research language
- `Wellness Angle` → `Trust / Quality`
- Hashtags strip nickname/recovery-claim tags; keep research tags
- Standard disclaimer on every row:  
  `For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.`
- Draft/Buffer ID fields cleared for clean automation start
- `P-BPC-001` `last_spotlight_date` set to `2026-07-27` (already smoke-tested)

## Status counts
- Pens: 22 Active, 1 Paused (`P-TB5-001` missing pen page)
- Vials: 22 Active, 2 Paused (missing standalone pages)

## Import into Google Sheets
1. Open your spotlight Google Spreadsheet (or create one named `PB-Vitality-Spotlights`)
2. For each CSV:
   - File → Import → Upload
   - Import location: **Replace current sheet** or **Insert new sheet**
   - Rename the tab exactly as in the table above
3. Share the spreadsheet with the Google account connected to n8n

## n8n daily queue (7 posts / compound / week)
Point Sheets read node at tab: **`1-compounds-pens`**

Cadence:
- Schedule = **Days / 1** (post every day)
- Same compound for 7 days (`week_start_date` + `posts_this_week`)
- Each day: different `daily_angle` → different Grok captions + image
- Next week: next Active compound

See `marketing/n8n-weekly-sheets-rotation.md`.

## Vials
Keep `1-compounds-vials` ready. Do not mix into the daily pens week unless you intentionally want a second daily stream.
