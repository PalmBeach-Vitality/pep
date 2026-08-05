# vid_gen_landscape_scenes — separate 500-scene workflow plan

**Workflow name (n8n):** `vid_gen_landscape_scenes`  
**Scenes CSV:** `marketing/sheets/4-vid-gen-landscape-scenes-500.csv`  
**Sheet tab name:** `4-vid-gen-landscape-scenes-500`

**Goal:** Build this **duplicated** landscape vid/visual workflow from a **500-scene spreadsheet**, with a **different Creatomate template** (later).  
**Rule:** Do **not** change the original image/vig workflow. Keep both side by side.

---

## Separation checklist

| Item | Original workflow | New VIG Gen 500 |
|---|---|---|
| n8n workflow | Existing (leave as-is) | Duplicated copy — rename e.g. `vig_gen_500` |
| Scenes sheet | `3-image-scenes-150` (or current) | **New 500-scene spreadsheet** |
| Creatomate | Current template | **New template** (Phase C — later) |
| Node names | Existing names | Prefer `lower_case_with_underscores` on any **new** nodes |
| Buffer / Sheets writeback | Existing columns | Own writeback columns or own tab (avoid collisions) |

---

## What we need from you

1. **Export / share the 500-scene spreadsheet** (CSV) — columns + 2–3 sample rows  
2. Confirm workflow name of the duplicate in n8n  
3. Later: new Creatomate **template ID** + which fields it expects  

---

## Assumed chain (new workflow only)

```text
schedule_vig_500
  → sheets_scenes_500          (read NEW 500-scene tab)
  → filter_active
  → sort_rotation              (last_used_date ASC, rotation_order ASC)
  → limit_1
  → prep_day_variant           (scene + product + caption lock + colors)
  → grok_http                  (system + user prompts)
  → grok_api                   (grok-4.5 captions)
  → parse_grok
  → grok_imagine               (2K full-lab / scene_brief)     [or keep if already in dup]
  → grok_imagine_story         (optional)
  → save_render_url
  → creatomate_render_500      ← NEW template (Phase C)
  → buffer_post_ig / buffer_post_fb
  → sheets_writeback_500       (last_used_date on scene_id)
```

Exact node list will match **your duplicate**; we only rename/add what’s missing.

---

## Phase A — Isolate & point at 500 scenes (start here)

1. Rename duplicated workflow → `vig_gen_500` (or your preferred name)  
2. Disable Schedule on the duplicate until smoke-tested (Manual only)  
3. Import 500-scene CSV as its own tab, e.g. `4-vig-scenes-500`  
4. Edit **`sheets` / Google Sheets read** in the **duplicate only** → that tab  
5. Confirm **`filter_active` → `sort_rotation` → `Limit`** use:
   - `status = Active`
   - sort: `last_used_date` ASC, then `rotation_order` ASC  
   - Limit = 1  
6. Execute through Limit → paste `scene_id` + `compound_id`

**Done when:** one scene row picks cleanly; original workflow untouched.

---

## Phase B — Scene → caption → image lock

1. **`prep_day_variant`** (in duplicate): map `scene_id`, `scene_category`, `scene_brief`, `caption_lock`, `compound_id`, `compound_name`, `canonical_url`, `product_form_detail`  
2. **`grok_http`**: plain-language sales system prompt + caption lock to scene product  
3. **`grok_api`**: `grok-4.5`, max_tokens 2000  
4. **`parse_grok`**: unchanged mapping (verify URLs aren’t hardcoded)  
5. **`grok_imagine` / story**: full-lab scene_brief, 10mL sterile crimp vial rules, no caution/biohazard signage, `resolution: 2k`  
6. Smoke: caption product = image product = scene product  

**Done when:** one manual run produces matching caption + image for the picked scene.

---

## Phase C — Creatomate duplicate (later)

1. Duplicate the Creatomate node / sub-path into `vig_gen_500` only  
2. Point to **new template ID**  
3. Remap template fields from `parse_grok` + image URL(s)  
4. Do **not** edit the original Creatomate template or node  
5. Smoke render → inspect output  

**Done when:** new template renders with today’s scene copy + asset.

---

## Phase D — Buffer + writeback (duplicate only)

1. Buffer IG/FB nodes post the Creatomate (or Imagine) asset  
2. **`sheets_writeback_500`**: update **500-scene** tab  
   - match `scene_id`  
   - set `last_used_date = today`  
   - optional: image URL, Buffer IDs  
3. Enable Schedule when stable  

**Done when:** run 2 picks a **different** `scene_id`.

---

## Hard rules (carry into 500 workflow)

- Keep **separate** from original  
- Full lab / environmental scenes (no product close-ups) unless a scene row says otherwise  
- Vials = **10mL sterile crimp-seal** (no black twist caps)  
- No caution / biohazard signage or alert words  
- Captions always match scene `compound_id`  
- New nodes: `lower_case_with_underscores`  

---

## Order of work

| Step | Action | Owner |
|---|---|---|
| 1 | You upload / share the **500-scene CSV** | Sal |
| 2 | Phase A — sheet + Limit pick | Together |
| 3 | Phase B — prompts + Imagine | Together |
| 4 | Phase C — Creatomate new template | Later |
| 5 | Phase D — Buffer + writeback | Together |

---

## Out of scope for this plan

- Editing the original vig/image workflow  
- Replacing the original Creatomate template  
- Video / Reel nodes (unless you add a separate vid workflow later)
