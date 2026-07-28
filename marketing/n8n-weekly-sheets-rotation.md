# Daily Sheets rotation (1 compound / day) — FDA-aligned

## Goal
Every day, autopost **one** Active compound spotlight.

Chain:

```text
Schedule (daily)
  → Google Sheets (read queue)
  → Filter (status = Active)
  → Sort (oldest last_spotlight_date, then rotation_order)
  → Limit (1)
  → Edit Fields (compound + Grok prompts)
  → Grok HTTP
  → Parse_Grok
  → IF compliance_ok = true
       → Build_spotlight_html → Render_spotlight → Save_render_url
         (or temporary Figma/Resolve fallback while render is set up)
       → Create a post (Buffer)
       → Google Sheets (update row writeback)
  → IF false → stop (do not post)
```

---

## FDA / compliance rules (do not weaken)
1. Keep science/research-only Grok system prompt.
2. Post **only** if `compliance_ok === true`.
3. Chemical names only (no KLOW / Wolverine / GLOW nicknames).
4. Mandatory disclaimer on IG/FB/TikTok captions.
5. Never auto-post `status = Paused`.
6. Sheet copy stays laboratory language only.

Mandatory disclaimer:
```text
For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.
```

---

## 1) Schedule Trigger — once per day

Open your existing **Schedule Trigger** node (already on the canvas — do not add a second one).

| Setting | Value |
|---|---|
| Trigger Interval | **Days** |
| Days Between Triggers | `1` |
| Trigger at Hour | e.g. `10` (your posting hour) |
| Trigger at Minute | e.g. `0` |

This = **1 run / day**. Combined with Limit 1 → **1 compound / day**.

> Remove any Weeks / weekday-only settings if still set from the old weekly plan.

---

## 2) Google Sheets — read queue

Tab: **`1-compounds-pens`**

| Setting | Value |
|---|---|
| Operation | Get Row(s) |
| Document | your spotlight spreadsheet |
| Sheet | `1-compounds-pens` |

No empty filters inside the Sheets node — filter next.

---

## 3) Filter — Active only

- `status` equals `Active`  
- Trim / convert types ON if needed

---

## 4) Sort

1. `last_spotlight_date` → Ascending (empty/oldest first)  
2. `rotation_order` → Ascending  

---

## 5) Limit — 1 item

**After:** Sort (or Filter if no Sort)  
**Before:** Edit Fields1 / Grok prep  

| Setting | Value |
|---|---|
| Max Items | `1` |

Critical for daily: without Limit 1 you will spam Figma/Grok/Buffer with every Active row.

---

## 6–9) Grok → Parse → compliance IF

Same as before. Dynamic image path: see `n8n-dynamic-spotlight-image.md`.

---

## 10) Buffer → Sheets writeback (required for daily)

**After:** `Create a post`  
**Before:** (end)

Update the posted row:

| Column | Value |
|---|---|
| `last_spotlight_date` | `={{ $now.toISO().slice(0,10) }}` |
| `ig_caption_draft` | `={{ $('Parse_Grok').item.json.ig_caption_draft }}` |
| `fb_caption_draft` | `={{ $('Parse_Grok').item.json.fb_caption_draft }}` |
| `tiktok_script_draft` | `={{ $('Parse_Grok').item.json.tiktok_script_draft }}` |
| `buffer_ig_post_id` | `={{ $json.id }}` (adjust to Buffer’s real id field) |
| `cycle_number` | `={{ Number($('Limit').item.json.cycle_number \|\| 0) + 1 }}` |

Without writeback, **tomorrow’s run posts the same compound again**.

---

## Daily behavior
- Day 1: oldest / never-posted Active  
- Day 2: next  
- …through ~22 Active pens, then cycles to oldest dates again  

~22 Active pens ≈ one full cycle about every 3 weeks at 1/day.

---

## Checklist
- [ ] Schedule = **Days / 1** (not weekly)
- [ ] Filter Active only
- [ ] Limit = 1
- [ ] IF compliance_ok before posting
- [ ] Image from Parse_Grok fields (render) — not a static Figma test slide long-term
- [ ] Writeback `last_spotlight_date` after Buffer
- [ ] Captions include Not for human use disclaimer
