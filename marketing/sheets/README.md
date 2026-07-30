# Google Sheets import — FDA-cleaned spotlight queues

## Files
| File | Tab name to use |
|---|---|
| `1-compounds-all.csv` | `1-compounds-all` (**daily Reel queue**) |
| `1-compounds-pens.csv` | `1-compounds-pens` (backup / pens-only) |
| `1-compounds-vials.csv` | `1-compounds-vials` (backup / vials-only) |
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
- **Merged all:** 47 rows, **44 Active** (daily rotation length), 3 Paused

## Import into Google Sheets
1. Open your spotlight Google Spreadsheet (or create one named `PB-Vitality-Spotlights`)
2. For each CSV:
   - File → Import → Upload
   - Import location: **Replace current sheet** or **Insert new sheet**
   - Rename the tab exactly as in the table above
3. Share the spreadsheet with the Google account connected to n8n

## n8n daily queue (1 different compound / day)
Point Sheets read node at tab: **`1-compounds-all`**

Cadence:
- Schedule = **Days / 1**
- Filter `status=Active` → Sort `last_spotlight_date` ASC → Limit **1**
- Each day: **new compound** + unique Reel still/video
- After post: write `last_spotlight_date` = today
- Loops after all Active compounds are used

See `marketing/n8n-daily-compound-rotation.md`.

**To reach 56 compounds:** add 12 more Active rows to `1-compounds-all`, then continue the same Sort → Limit 1 flow.

## Vials / pens
Both are already merged into `1-compounds-all` as separate SKUs (Pen row and Vial row = different days). Reel visuals always use a **glass research vial** hero (no injector devices), regardless of `product_form`.
