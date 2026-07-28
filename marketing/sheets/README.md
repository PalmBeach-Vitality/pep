# Google Sheets import — FDA-cleaned spotlight queues

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

## n8n daily queue (start here)
Point Sheets read node at tab: **`1-compounds-pens`**

Rotation:
- Schedule = **Days / 1**
- Filter `status = Active`
- Sort `last_spotlight_date` ASC, `rotation_order` ASC
- Limit `1`
- After Buffer success → write back `last_spotlight_date`

One Active pen compound **per day**.

## Vials
Keep `1-compounds-vials` ready. Do **not** run pens + vials the same day unless you intentionally want 2 posts. For strict 1/day, pens only first.
