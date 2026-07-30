# Daily compound rotation — 1 different compound per day

## Goal
- **1 Reel per day**
- **1 different compound every day** (not the same compound for a week)
- Rotate through the **full Active catalog**, then loop
- Each Reel must look **completely different** (new compound + unique visual seed)

```text
Schedule (daily)
  → Sheets read: 1-compounds-all
  → Filter status = Active
  → Sort last_spotlight_date ASC (empty first), then rotation_order ASC
  → Limit 1
  → Prep_day_variant
  → Grok → still → video → Buffer → Sheets writeback (last_spotlight_date = today)
```

---

## Inventory (current repo)

| Pool | Rows | Active | Paused |
|---|---:|---:|---:|
| Pens | 23 | 22 | 1 |
| Vials | 24 | 22 | 2 |
| **Merged `1-compounds-all`** | **47** | **44** | **3** |

**Not 56 yet.** Active rotation length today = **44 days**, then it loops.  
To reach **56 compounds**: add **12 more Active rows** to `1-compounds-all` (new SKUs / pages), then re-number `rotation_order`.

---

## Sheets setup

### 1) Import merged queue
1. Upload `marketing/sheets/1-compounds-all.csv`
2. Tab name exactly: **`1-compounds-all`**
3. Keep pens/vials tabs as backups — daily Reels read **only** `1-compounds-all`

### 2) Columns used for rotation
| Column | Role |
|---|---|
| `status` | `Active` = in the daily queue |
| `rotation_order` | Stable order 1…N |
| `last_spotlight_date` | YYYY-MM-DD of last successful Reel/post — oldest / empty goes next |
| `compound_id` | Unique per row (Pen SKU and Vial SKU are different days) |

### 3) Stop weekly locking
- Do **not** filter on `week_start_date`
- Do **not** require `posts_this_week`
- Remove / ignore any “same compound all week” Filter

---

## n8n changes (do these now)

### A) Sheets read node
- Document / sheet tab: **`1-compounds-all`**
- Return all rows (Filter/Sort/Limit handle selection)

### B) Filter
- `status` **equals** `Active`

### C) Sort (add if missing)
1. `last_spotlight_date` — ascending (empty / blank first)
2. `rotation_order` — ascending

### D) Limit
- Max Items = **`1`**

### E) Delete or bypass `Pick_week_compound`
If that node still locks one compound for 7 days, disconnect it.

### F) Sheets writeback (after successful Buffer reel)
Update the **same `compound_id` row**:
| Field | Value |
|---|---|
| `last_spotlight_date` | `{{ $now.toISODate() }}` |

Optional: keep reel URL / Buffer IDs columns as already mapped.

---

## Why Reels looked similar
1. Same compound all week (weekly lock)
2. Same product still style
3. Weekday-only variants recycle every 7 days

## How each day becomes a different Reel
1. **New compound_id every day** (this doc)
2. Still + video prompts use that compound’s chemical name as hero
3. `unique_run_stamp` changes every run
4. `daily_scene_seed` (below) hashes **compound + date** so visuals don’t repeat on the same weekday

---

## Prep_day_variant — add `daily_scene_seed`

**Include Other Input Fields = ON**

| Name | Value (fx ON) |
|---|---|
| `daily_scene_seed` | below |

```text
{{ String($json.compound_id || '') + '|' + $now.toISODate() + '|' + String($json.rotation_order || '') + '|' + String($json.compound_name || '') }}
```

Also keep / refresh:
- `daily_video_format`
- `daily_motion_brief`
- `daily_camera_variant`
- `unique_run_stamp`

### Make format depend on compound (not only weekday)

Replace `daily_video_format` with:

```text
{{ ({0:'Futuristic Vial Identity',1:'Purity Spec Readout',2:'Peptide Synthesis Prototype',3:'Cutting-Edge Assay Bay',4:'Nano Catalog Drop',5:'Research Seal Future Lab',6:'99.99 Purity Glass Close'})[Number($json.rotation_order || $now.weekday) % 7] }}
```

Replace `daily_motion_brief` with:

```text
{{ ({0:'Slow push-in on photoreal research vial in a futuristic peptide synthesis lab; cool cyan-blue tech light sweep; compound name hold',1:'Gentle lateral slide past holographic-clean purity instrumentation; focus pull to 99.99% purity readout aesthetic; glass refraction',2:'Orbit a cutting-edge peptide synthesis / prototype reactor bay with vial hero; engineering calm; no use demo',3:'Bench dolly through a futuristic assay engineering bay; vial rack + precision instruments; subtle LED pulse',4:'Rise onto acrylic riser with vial + advanced lab tech props; settle; catalog CTA end card',5:'Calm hold on sealed research vial in sterile future-lab; research-use seal fades in final 2 seconds',6:'Extreme macro vial glass / crystal meniscus; micro push; premium 99.99% purity chemistry close'})[Number($json.rotation_order || $now.weekday) % 7] }}
```

Replace `daily_camera_variant` with:

```text
{{ ({0:'camera starts slightly LOW-LEFT, push-in toward vial label',1:'camera starts HIGH-RIGHT, slow lateral slide across glassware',2:'camera orbits CLOCKWISE ~15 degrees around vial / synthesis setup',3:'camera dolly LEFT-TO-RIGHT across assay bench plane',4:'camera rises from BELOW riser then settles eye-level on vial',5:'locked tripod, vial scale breathes via focus pull only',6:'extreme MACRO start on vial glass edge, micro push to compound name'})[Number($json.rotation_order || $now.weekday) % 7] }}
```

---

## Still / video prompts — force uniqueness

In **`grok_imagine_reel_still`** and **`grok_video_start`**, keep the vial-only + futuristic + 99.99% purity rules, and add this line into both prompts:

```text
'This Reel is UNIQUE for compound ' + String($('Limit').item.json.compound_id || $('Prep_day_variant').item.json.compound_id || '') + ' — ' + String($('Parse_Grok').item.json.display_name || $('Limit').item.json.compound_name || '') + '. Scene seed: ' + String($('Prep_day_variant').item.json.daily_scene_seed || '') + '. Do not reuse prior compositions, prop layouts, or camera angles from other compounds.',
```

(If your Limit node has a different name, use the node that outputs the single compound row.)

---

## Smoke test
1. Run workflow → note `compound_id` A  
2. Manually set that row’s `last_spotlight_date` to today (or let writeback do it)  
3. Run again → must get a **different** `compound_id` B  
4. Still image must be glass **vial** only (no injector / writing instrument)  
5. Video must match that new still

---

## Reaching 56 compounds
1. Add 12 new Active product rows to Sheets (`compound_id`, name, URL, etc.)
2. Set `status=Active`
3. Assign new `rotation_order` values (45–56)
4. Re-export / sync `1-compounds-all.csv` when ready

Until then, automation correctly rotates **all 44 Active** compounds, one per day.
