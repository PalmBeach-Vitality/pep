# Weekly Sheets rotation (1 compound / week) — FDA-aligned

## Goal
Every week, post **one** Active compound spotlight only.

Chain:

```text
Schedule (weekly)
  → Google Sheets (read queue)
  → Filter (status = Active)
  → Sort (oldest last_spotlight_date, then rotation_order)
  → Limit (1)
  → Edit Fields (compound + Grok prompts)
  → Grok HTTP
  → Parse_Grok
  → IF compliance_ok = true
       → Wait (30–60s)
       → Figma_export (ids=2020:5; On Error Continue; Retry 60s)
       → Resolve_image (Figma URL or GitHub PNG fallback)
       → Create a post (Buffer)
       → Google Sheets (update row writeback)
  → IF false → stop (do not post)
```

---

## FDA / compliance rules (do not weaken)
1. Keep science/research-only Grok system prompt (already set).
2. Post **only** if `compliance_ok === true`.
3. Chemical names only (Grok overrides nicknames like KLOW / Wolverine / GLOW).
4. Mandatory disclaimer must remain on IG/FB/TikTok captions.
5. Never auto-post rows with `status = Paused`.
6. Do not invent medical/wellness claims in sheet fields either — prefer laboratory language in `short_tagline` / `key_benefit_theme` when you edit the sheet later.

Recommended sheet disclaimer (update column later if you want):
```text
For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.
```

---

## 1) Schedule Trigger — once per week

| Setting | Value |
|---|---|
| Trigger Interval | Weeks |
| Weeks Between Triggers | `1` |
| Trigger at Hour | pick your time (e.g. `10`) |
| Trigger on Weekday | pick one day (e.g. Monday) |

This enforces **one run / week**. Combined with Limit 1 → **one compound / week**.

---

## 2) Google Sheets — read queue

Use one queue sheet to start (recommended): **`1-compounds-pens`**

| Setting | Value |
|---|---|
| Operation | Get Row(s) / Read |
| Document | your spotlight spreadsheet |
| Sheet | `1-compounds-pens` |

Return all rows (filter in next nodes).

> Vials: either alternate later, or keep pens-only until rotation is stable. Still **one compound total per week**.

---

## 3) Filter — Active only

Filter node:

- `status` equals `Active`

Paused rows (missing pages / placeholders) never post.

---

## 4) Sort — fair rotation

Sort node (two keys):

1. `last_spotlight_date` — Ascending  
   (empty/oldest first so new compounds get priority)
2. `rotation_order` — Ascending  

---

## 5) Limit — exactly one

| Setting | Value |
|---|---|
| Max Items | `1` |

---

## 6) Edit Fields — prepare compound + Grok prompts

Name: `Prep_compound`  
Mode: Manual  
Include Other Input Fields: OFF

### A) Pass-through from sheet (map each)
`compound_id`, `compound_name`, `category`, `product_form`, `short_tagline`, `key_benefit_theme`, `mechanism_1_liner`, `spotlight_angle`, `figma_template_type`, `canonical_url`, `hashtags_core`, `compliance_notes`, `disclaimer_short`, `notes`, `rotation_order`, `cycle_number`

Use expressions like:
```text
{{ $json.compound_id }}
```

### B) `system_prompt` (Fixed text)
Paste your full science/research-only system prompt (from smoke-test body) as **Fixed** (fx OFF).

### C) `user_prompt` (Expression / fx ON)
```text
{{ 'Write science and research-only captions. Chemical names only. No marketing, no human-use language.\n\nIMPORTANT: Instagram, Facebook, and TikTok captions must ALL end with the mandatory disclaimer.\n\ncompound:\n' + JSON.stringify({ compound_id: $json.compound_id, compound_name: $json.compound_name, category: $json.category, product_form: $json.product_form, short_tagline: $json.short_tagline, key_benefit_theme: $json.key_benefit_theme, mechanism_1_liner: $json.mechanism_1_liner, spotlight_angle: $json.spotlight_angle, figma_template_type: $json.figma_template_type, canonical_url: $json.canonical_url, hashtags_core: $json.hashtags_core, compliance_notes: $json.compliance_notes, disclaimer_short: $json.disclaimer_short, notes: $json.notes }, null, 2) }}
```

---

## 7) Grok HTTP — dynamic body

Use the setup that already works for you (Raw + application/json), with fx ON on Body:

```text
{{ JSON.stringify({ model: 'grok-3', temperature: 0.2, max_tokens: 900, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: $json.system_prompt }, { role: 'user', content: $json.user_prompt }] }) }}
```

Header: `Content-Type: application/json` + Bearer auth.

If this expression fails in your n8n version, keep the static smoke body for one more week while we harden it — but rotation nodes (Schedule/Filter/Sort/Limit) should still be added now.

---

## 8) Parse_Grok
Keep your existing Parse_Grok mappings.

---

## 9) IF — FDA gate (required)

Condition:
- `compliance_ok` is `true`  
  (or equals `true` / `={{ $json.compliance_ok === true }}`)

| Branch | Action |
|---|---|
| true | continue to Figma → Buffer → Sheets update |
| false | stop (no post, no writeback of success) |

---

## 10) Figma + Buffer
Keep current working nodes:
- Figma_export (`ids=2020:5` for Hero Spotlight smoke; later map by template)
- Save_figma_image
- Create a post

> Template mapping by `figma_template_type` can come next. For now Hero Spotlight frame is fine for first weekly runs if most first posts use that template, or manually switch node id when needed.

---

## 11) Google Sheets — writeback (after successful Buffer)

Operation: **Update Row**

Match on: `compound_id` = `{{ $('Prep_compound').item.json.compound_id }}`  
(or your exact Prep node name / sheet row id if you use row number)

Update fields:

| Column | Value |
|---|---|
| `last_spotlight_date` | `={{ $now.toISO().slice(0,10) }}` (YYYY-MM-DD) |
| `ig_caption_draft` | `={{ $('Parse_Grok').item.json.ig_caption_draft }}` |
| `fb_caption_draft` | `={{ $('Parse_Grok').item.json.fb_caption_draft }}` |
| `tiktok_script_draft` | `={{ $('Parse_Grok').item.json.tiktok_script_draft }}` |
| `buffer_ig_post_id` | `={{ $json.id }}` (from Buffer output; adjust to actual field) |
| `cycle_number` | `={{ Number($('Prep_compound').item.json.cycle_number || 0) + 1 }}` |

This ensures next week picks a different Active compound (because this one’s `last_spotlight_date` is newest).

---

## Weekly behavior (example)
- Week 1: first Active by rotation_order with empty `last_spotlight_date`
- Week 2: next never-posted / oldest date
- … continues through Active list, then oldest dates again

---

## Smoke test (manual)
1. Temporarily set Schedule aside; use **Manual Trigger**
2. Run through Limit 1 — confirm only 1 item
3. Confirm compound is Active
4. Run Grok → Parse → IF → Figma → Buffer
5. Confirm Sheets writeback updated `last_spotlight_date`
6. Run again same day — should pick a **different** compound (because date updated)

---

## Checklist
- [ ] Schedule = weekly
- [ ] Filter Active only
- [ ] Limit = 1
- [ ] IF compliance_ok before posting
- [ ] Writeback last_spotlight_date after Buffer success
- [ ] No Paused compounds posting
- [ ] Captions still include Not for human use disclaimer
