# Daily product rotation — pens + vials (1 unique product / day)

## What you have
2 Google Sheets tabs:
1. `1-compounds-pens`
2. `1-compounds-vials`

**Merged import file (use this):** `marketing/sheets/1-compounds-all-daily.csv`  
Tab name: **`1-compounds-all`**

| | Count |
|---|---:|
| Total rows | 47 |
| **Active (daily cycle)** | **44** |
| Paused (skipped) | 3 |

Each Active row = **one product day** (Pen SKU and Vial SKU of the same chemical are **different days**).

---

## Goal
Every day must produce:
1. **Different product** (`compound_id`)
2. **Unique feed image** for that product
3. **Unique story image** for that product (if used)
4. **Unique Reel still + video** for that product

No weekly lock. No repeating yesterday’s product until the full Active list cycles.

```text
Schedule (daily)
  → Sheets: 1-compounds-all
  → Filter status = Active
  → Sort last_spotlight_date ASC (empty first), then rotation_order ASC
  → Limit 1
  → Prep_day_variant   (+ daily_scene_seed from compound_id)
  → Grok captions (for THIS compound only)
  → GROK_Imagine (feed)     ← must use today’s compound + scene seed
  → Grok_imagine_story      ← must use today’s compound + scene seed
  → grok_imagine_reel_still ← vial + futuristic lab, THIS compound only
  → video → Buffer → Sheets writeback last_spotlight_date = today
```

---

## Sheets — do this once

1. Import `1-compounds-all-daily.csv` as tab **`1-compounds-all`**
2. Point n8n Sheets **read** at that tab only
3. Keep pens/vials tabs as backups (do not read them in the daily workflow)
4. Remove any Filter on `week_start_date`
5. `P-BPC-001` is already marked `last_spotlight_date=2026-07-30` (Reel already ran)

### Columns that matter
| Column | Role |
|---|---|
| `compound_id` | Unique product key (e.g. `P-BPC-001`, `V-BPC-001`) |
| `compound_name` | Chemical / product name for captions + visuals |
| `canonical_url` | Catalog link for that exact product |
| `status` | Only `Active` enters the queue |
| `rotation_order` | Stable order 1…44 |
| `last_spotlight_date` | When this product last got a full day (image + reel) |

---

## n8n selection (required)

| Node | Setting |
|---|---|
| Sheets | Read `1-compounds-all` |
| Filter | `status` equals `Active` |
| Sort | 1) `last_spotlight_date` ASC (empty first) 2) `rotation_order` ASC |
| Limit | **1** |

**Delete / bypass** `Pick_week_compound` and any `week_start_date` filter.

### Writeback after success
Update the row matching today’s `compound_id`:
| Field | Value |
|---|---|
| `last_spotlight_date` | `{{ $now.toISODate() }}` |
| `reel_video_url` | from `save_video_url` |
| `buffer_ig_reel_id` / `buffer_fb_reel_id` | from Buffer nodes |
| optional `feed_image_url` / `story_image_url` / `reel_still_url` | today’s image URLs |

---

## Prep_day_variant — uniqueness fields

Include Other Input Fields = **ON**

### `daily_scene_seed` (required)
```text
{{ String($json.compound_id || '') + '|' + String($json.compound_name || '') + '|' + String($json.product_form || '') + '|' + $now.toISODate() + '|' + String($json.rotation_order || '') }}
```

### `daily_video_format` (by product, not weekday)
```text
{{ ({0:'Futuristic Vial Identity',1:'Purity Spec Readout',2:'Peptide Synthesis Prototype',3:'Cutting-Edge Assay Bay',4:'Nano Catalog Drop',5:'Research Seal Future Lab',6:'99.99 Purity Glass Close'})[Number($json.rotation_order || 1) % 7] }}
```

### `daily_motion_brief`
```text
{{ ({0:'Slow push-in on photoreal research vial in a futuristic peptide synthesis lab; cool cyan-blue tech light sweep; compound name hold',1:'Gentle lateral slide past holographic-clean purity instrumentation; focus pull to 99.99% purity readout aesthetic; glass refraction',2:'Orbit a cutting-edge peptide synthesis / prototype reactor bay with vial hero; engineering calm; no use demo',3:'Bench dolly through a futuristic assay engineering bay; vial rack + precision instruments; subtle LED pulse',4:'Rise onto acrylic riser with vial + advanced lab tech props; settle; catalog CTA end card',5:'Calm hold on sealed research vial in sterile future-lab; research-use seal fades in final 2 seconds',6:'Extreme macro vial glass / crystal meniscus; micro push; premium 99.99% purity chemistry close'})[Number($json.rotation_order || 1) % 7] }}
```

### `daily_camera_variant`
```text
{{ ({0:'camera starts slightly LOW-LEFT, push-in toward vial label',1:'camera starts HIGH-RIGHT, slow lateral slide across glassware',2:'camera orbits CLOCKWISE ~15 degrees around vial / synthesis setup',3:'camera dolly LEFT-TO-RIGHT across assay bench plane',4:'camera rises from BELOW riser then settles eye-level on vial',5:'locked tripod, vial scale breathes via focus pull only',6:'extreme MACRO start on vial glass edge, micro push to compound name'})[Number($json.rotation_order || 1) % 7] }}
```

### `unique_run_stamp`
```text
{{ $now.toISO() + '-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0') }}
```

---

## Hard rule for ALL image + reel nodes

Every Imagine / video body must include today’s product identity:

```text
'Today product ONLY: ' + String($('Prep_day_variant').item.json.compound_id) + ' — ' + String($('Parse_Grok').item.json.display_name || $('Prep_day_variant').item.json.compound_name) + '. Catalog: ' + String($('Prep_day_variant').item.json.canonical_url || '') + '. Scene seed: ' + String($('Prep_day_variant').item.json.daily_scene_seed || '') + '. Do not show any other compound name or reuse yesterday’s composition.'
```

### Reel visual rules (unchanged)
- Hero = **glass research vial** only
- Futuristic peptide synthesis lab + **99.99% PURITY — PEPTIDE SYNTHESIS**
- **Never** injector devices / writing instruments
- Ignore `product_form` for the picture (Pen rows still get a vial hero; captions/URL stay that product’s)

### Feed / story images
- Must show **today’s chemical name** from Parse/Prep
- Must use `daily_scene_seed` + color/pattern/motif variants
- Must look different from every other product day

---

## Smoke test
1. Run once → note `compound_id` A + open feed image + reel still  
2. Confirm name on images matches product A  
3. Writeback sets `last_spotlight_date`  
4. Run again → must get **different** `compound_id` B  
5. Images/reel for B must not look like A and must name B

---

## Cycle
- **44 days** through all Active products, then loops (oldest `last_spotlight_date` first)
- To add more products later: append Active rows to `1-compounds-all` and continue the same Sort → Limit 1 flow
