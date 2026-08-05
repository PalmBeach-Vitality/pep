# Daily autopost — same compound all week, new caption + image each day

## Goal
- **Post every day**
- **Same compound for 7 days**
- **New captions + new image every day** (different angle)
- **Switch compound next week**

```text
Schedule (daily)
  → Sheets read queue
  → Filter Active
  → Pick_week_compound   (same compound Mon–Sun)
  → Prep_day_variant     (weekday → angle)
  → Grok → Parse_Grok
  → IF compliance_ok
       → Render image from today’s creative_brief
       → Buffer Create a post
       → Sheets writeback (day count / last_post_date)
```

---

## How compound locking works

Add these columns to `1-compounds-pens` if missing:

| Column | Purpose |
|---|---|
| `week_start_date` | Monday date (YYYY-MM-DD) when this compound became the week’s focus |
| `posts_this_week` | 0–7 count of successful daily posts |
| `last_spotlight_date` | last successful post day |
| `status` | Active / Paused |

### Weekly pick rules
1. If any Active row has `week_start_date` = **this week’s Monday** AND `posts_this_week` < 7 → **use that row** (same compound).
2. Else → pick next Active by `rotation_order` / oldest `last_spotlight_date`, set:
   - `week_start_date` = this Monday
   - `posts_this_week` = 0
3. After each successful Buffer post:
   - `posts_this_week` += 1
   - `last_spotlight_date` = today
4. When `posts_this_week` reaches 7, next Monday’s run starts rule (2) for a new compound.

### This week’s Monday expression (n8n)
```text
={{ $now.startOf('week').plus({ days: 1 }).toISODate() }}
```
> If your week starts Monday already in your timezone settings, use:
> `={{ $now.startOf('week').toISODate() }}`  
> Check once: run Manual Trigger and confirm the date is the Monday you expect.

---

## 1) Schedule — daily

| Setting | Value |
|---|---|
| Trigger Interval | Days |
| Days Between Triggers | `1` |
| Hour | your post time (e.g. 10) |

---

## 2) Sheets → Filter Active

Same as now. No empty Sheets filters.

---

## 3) Add `Pick_week_compound`

**After:** `Filter` (Kept)  
**Before:** `Prep_day_variant`

You need **two paths** (IF + Merge) or do it manually in Sheets the first weeks.

### Simple version (designer-friendly, start here)

**Each Sunday night or Monday morning in Sheets:**
1. Clear `week_start_date` / set `posts_this_week=0` on finished compound (optional)
2. Set **this week’s compound** row:
   - `week_start_date` = this Monday
   - `posts_this_week` = 0

**In n8n Filter (or second Filter after Active):**
- `week_start_date` equals `={{ $now.startOf('week').plus({ days: 1 }).toISODate() }}`  
  (adjust Monday expression after one test)
- Then **Limit 1**

Until full auto-advance is built, you manually assign the week’s compound once per week; n8n posts it daily with new variants.

### Full auto version (later)
IF node:
- true branch: rows matching this Monday `week_start_date` → Limit 1  
- false branch: Sort rotation → Limit 1 → Edit Fields set `week_start_date`  
Merge → continue  

(We can wire the full IF/Merge when the daily variant path is stable.)

---

## 4) Add `Prep_day_variant`

**After:** `Pick_week_compound` / Limit  
**Before:** Grok HTTP (or Edit Fields1 raw body)

Node: **Edit Fields**  
Name: `Prep_day_variant`  
Include Other Input Fields: **ON**

| Name | Mode | Value |
|---|---|---|
| `day_of_week` | Expression | `={{ $now.weekdayLong }}` |
| `day_index` | Expression | `={{ $now.weekday }}` |
| `daily_angle` | Expression | see below |
| `daily_image_brief` | Expression | see below |

### `daily_angle` expression (Mon–Sun research-safe)
```text
={{ ({1:'Identity / catalog listing',2:'Biochemical class / mechanism descriptor',3:'Laboratory format (pen or vial)',4:'In-vitro research context',5:'Documentation / catalog reference',6:'Research-use clarification (FAQ)',7:'Quality / laboratory sourcing frame'})[$now.weekday] || 'Identity / catalog listing' }}
```

### `daily_image_brief` expression
```text
={{ ({1:'Hero compound name dominant; clean lab catalog slide',2:'Emphasize molecular / biochemical class line',3:'Emphasize pre-filled research format / vial format',4:'Emphasize in-vitro / assay research framing',5:'Emphasize catalog documentation CTA',6:'Emphasize research-use only clarification',7:'Emphasize laboratory quality / sourcing neutrality'})[$now.weekday] || 'Hero compound name dominant' }}
```

> Luxon weekday: Monday=1 … Sunday=7 in many n8n setups. If your first post maps wrong, tell me what `$now.weekday` prints and we’ll remap.

---

## 5) Grok — force a *new* caption + creative brief each day

Keep the same compound fields. Add day fields into the user prompt.

Use updated expression in `marketing/n8n-user-prompt-daily-variant.txt`.

Hard rules for Grok (already in system prompt; reinforce in user prompt):
- Same `compound_name` all week
- **Different** IG/FB/TikTok copy than other days (no duplicate captions)
- **Different** `creative_brief.headline/subhead/bullets` matching `daily_angle`
- Still FDA / research-only; chemical names only; disclaimer required

---

## 6) Image must follow *today’s* brief

**After:** `Parse_Grok`  
**Before:** `Create a post`

Render from today’s:
- `figma_headline`
- `figma_subhead`
- `figma_bullet_1/2/3`
- `figma_cta`

→ Htmlcsstoimage / Placid / Grok Imagine  

Do **not** export one static Figma frame for all 7 days — that breaks “different images each day.”

---

## 7) Buffer

Daily Create a post:
- Text = today’s `ig_caption_draft`
- Image = today’s render URL

---

## 8) Sheets writeback

**After:** `Create a post`  
**Before:** end

| Column | Value |
|---|---|
| `last_spotlight_date` | `={{ $now.toISODate() }}` |
| `posts_this_week` | `={{ Number($json.posts_this_week \|\| $('Prep_day_variant').item.json.posts_this_week \|\| 0) + 1 }}` |
| `ig_caption_draft` | today’s caption (optional archive) |
| `buffer_ig_post_id` | Buffer id |

Match row on `compound_id`.

---

## Example week (TB-500)

| Day | Angle | Caption | Image |
|---|---|---|---|
| Mon | Identity | Catalog ID post | Hero name slide |
| Tue | Biochemical class | Class-focused post | Class-focused slide |
| Wed | Format | Pen/vial format post | Format-focused slide |
| Thu | In-vitro context | Assay framing post | Context slide |
| Fri | Documentation | Catalog CTA post | Docs/CTA slide |
| Sat | FAQ research-use | Clarification post | Disclaimer-forward slide |
| Sun | Quality / lab frame | Sourcing-neutral post | Quality frame slide |

Monday next week → next Active compound, day variants restart.

---

## Checklist
- [ ] Schedule = daily
- [ ] One compound locked for the week (`week_start_date`)
- [ ] Prep_day_variant sets `daily_angle`
- [ ] Grok gets day fields → new captions daily
- [ ] Image rendered from that day’s creative_brief
- [ ] Writeback `posts_this_week` + `last_spotlight_date`
- [ ] Switch compound when week completes / next Monday
