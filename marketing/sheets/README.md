# Google Sheets import — FDA-cleaned spotlight queues

## Files
| File | Tab name to use |
|---|---|
| `1-compounds-all-daily.csv` | `1-compounds-all` (**daily queue — pens + vials merged from Sal live sheets**) |
| `1-compounds-all.csv` | same merge (alias) |
| `1-compounds-pens.csv` | `1-compounds-pens` (backup) |
| `1-compounds-vials.csv` | `1-compounds-vials` (backup) |
| `2-product-page-mapping-pens.csv` | `2-product-page-mapping-pens` (SKU map, not daily picker) |
| `2-product-page-mapping-vials.csv` | `2-product-page-mapping-vials` (SKU map, not daily picker) |

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

## n8n daily queue (1 different product / day)
Point Sheets read node at tab: **`1-compounds-all`**  
(import from `1-compounds-all-daily.csv` — merged from your live pens + vials sheets)

Cadence:
- Schedule = **Days / 1**
- Filter `status=Active` → Sort `last_spotlight_date` ASC → Limit **1**
- Each day: **new product** + unique **feed image + story image + Reel**
- After post: write `last_spotlight_date` = today
- **44 Active products** → 44-day cycle, then loops

See `marketing/n8n-daily-compound-rotation.md`.

## Vials / pens
Merged as separate SKUs (Pen row and Vial row = different days).  
Reel visuals always use a **glass research vial** hero (no injector devices), regardless of `product_form`. Captions/URL stay specific to that day’s product.
