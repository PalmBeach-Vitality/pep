# Scene library + matching captions (image-only)

## Assignment (confirmed)
1. **No product close-ups** — images are **full laboratory scenes**
2. **150 scenes total**
   - 50 × full lab environments
   - 50 × full lab + **10mL vial** (specific product each)
   - 50 × full lab + **3mL dosage pen** (specific product each)
3. Every vial/pen scene is **locked to one product**
4. **Captions always match** that scene’s `compound_id` / URL

## Sheet to import
**File:** `marketing/sheets/3-image-scenes-150.csv`  
**Tab name:** `3-image-scenes-150`

| scene_category | Count | Product lock |
|---|---:|---|
| `lab_scene` | 50 | Yes (for caption/typography; no close-up hero) |
| `vial_10ml_scene` | 50 | Yes — Active vials rotated across 50 scenes |
| `pen_3ml_scene` | 50 | Yes — Active pens rotated across 50 scenes |

With 22 Active vials + 22 Active pens, products repeat across scenes with **different lab environments**.

---

## Target n8n chain (image-only)

```text
Schedule
  → Google Sheets   (read tab 3-image-scenes-150)
  → filter_active   (status = Active)
  → sort_rotation   (last_used_date ASC, then rotation_order ASC)
  → Limit           (1)   ← today’s SCENE (already includes compound_id)
  → Prep_day_variant
  → Edit Fields1 / GROK_HTTP   ← captions for THIS compound_id only
  → Parse_Grok
  → GROK_Imagine               ← uses scene_brief (full lab)
  → Grok_imagine_story         ← same scene_brief, 9:16
  → Save_render_URL
  → Buffer_post_IG / Buffer_post_FB
  → Sheets_writeback           ← set last_used_date on this scene_id
```

**Important:** Stop picking the product from `1-compounds-all` for images.  
The **scene row is the source of truth** for both visuals and captions.

---

## Why this fixes mismatched captions
Old path: product picker ≠ image prompt subject.  
New path: one scene row carries:
- `scene_brief` → Imagine
- `compound_id` / `compound_name` / `canonical_url` → Grok captions
- `caption_lock` → hard instruction in user prompt

---

## Node changes (by name)

### 1) Google Sheets (read)
- Document/tab: **`3-image-scenes-150`**
- Return all rows

### 2) `filter_active`
- `status` equals `Active`

### 3) `sort_rotation` (Type = Simple)
1. `last_used_date` Ascending  
2. `rotation_order` Ascending  

### 4) `Limit`
- Max Items = `1`

### 5) `Prep_day_variant`
Keep colors if you want. **Add/ensure these fields** (Include Other Input Fields = ON):

| Name | Value (fx ON) |
|---|---|
| `scene_id` | `{{ $json.scene_id }}` |
| `scene_category` | `{{ $json.scene_category }}` |
| `scene_brief` | `{{ $json.scene_brief }}` |
| `caption_lock` | `{{ $json.caption_lock }}` |
| `compound_id` | `{{ $json.compound_id }}` |
| `compound_name` | `{{ $json.compound_name }}` |
| `canonical_url` | `{{ $json.canonical_url }}` |
| `product_form_detail` | `{{ $json.product_form_detail }}` |

### 6) `GROK_HTTP` user prompt
Force compound from the scene row (not a random sheet row). Include:

```text
caption_lock: must describe ONLY compound_id + compound_name + canonical_url from input.
Do not mention any other peptide/product.
```

Pass:
- `compound_id`, `compound_name`, `canonical_url`, `product_form` / `product_form_detail`, `scene_category`

### 7) `GROK_Imagine` + `Grok_imagine_story`
Use bodies in:
- `marketing/n8n-grok-imagine-body-feed.txt`
- `marketing/n8n-grok-imagine-body-story.txt`

They read `$('Prep_day_variant').item.json.scene_brief` and ban close-ups.

### 8) `Sheets_writeback`
Update the **scene** row (match `scene_id`):
| Field | Value |
|---|---|
| `last_used_date` | `{{ $now.toISODate() }}` |

---

## Visual rules (hard)
- **Wide / environmental** lab shots only  
- Product (vial or pen) = **mid-ground**, never filling the frame  
- No extreme macros, no isolated packshots on void backgrounds  
- No people, no injection acts, no needles in use  

---

## Smoke test
1. `Limit` output shows a `scene_id` + `compound_id`  
2. Caption names that same compound + URL  
3. Image shows a **full lab**, product only as mid-ground (or typography for `lab_scene`)  
4. Writeback sets `last_used_date` on that `scene_id`  
5. Next run → different `scene_id`
