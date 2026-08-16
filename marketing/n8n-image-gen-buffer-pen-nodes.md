# image_gen_buffer — pen branch (node-by-node)

Workflow: `image_gen_buffer`  
Insert immediately **before** existing `GROK_Imagine`.

```text
… → if_compliance (or current node that feeds GROK_Imagine)
      → if_pen_scene
           TRUE  → grok_imagine_pen_edit ─┐
           FALSE → GROK_Imagine ──────────┼→ merge_imagine_out → Save_render_URL
```

Accent rule (already in pen-edit body):
- BLUE: Semaglutide / Tirzepatide / Retatrutide
- RED: all other peptides

Reply **node 1 ok** after each node.

---

## Node 1 — `if_pen_scene`

**Node type:** IF

| Parameter | Value |
|---|---|
| Node name | `if_pen_scene` |
| Conditions | 1 condition |
| Combinator | AND |
| Value 1 (fx ON) | `{{ $('Prep_day_variant').item.json.scene_category }}` |
| Operation | is equal to |
| Value 2 | `pen_3ml_scene` |

**Why:** Pens go to Imagine **edits** (template lock). Lab/vial stay on generations.

**Wire:**
- Before: the node that currently feeds `GROK_Imagine` (usually `if_compliance` true, or `Parse_Grok`)
- After TRUE: `grok_imagine_pen_edit` (add in Node 2)
- After FALSE: existing `GROK_Imagine`
- Disconnect the old direct wire into `GROK_Imagine` from the before-node

**Test:** Execute once. TRUE when `scene_category` is `pen_3ml_scene`; FALSE for `lab_scene` / `vial_10ml_scene`.

---

## Node 2 — `grok_imagine_pen_edit`

**Node type:** HTTP Request  
**Action:** DUPLICATE `GROK_Imagine`, then rename and change URL + body

| Parameter | Value |
|---|---|
| Node name | `grok_imagine_pen_edit` |
| Method | POST |
| URL | `https://api.x.ai/v1/images/edits` |
| Authentication | Same credential as `GROK_Imagine` (xAI Header Auth / Bearer) |
| Send Headers | ON |
| Header | `Content-Type` = `application/json` |
| Send Body | ON |
| Body Content Type | JSON / Raw JSON |
| Specify Body | Using Expression (fx ON) |

**Body (fx ON) — paste entire file:**  
https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/n8n-grok-imagine-body-pen-edit.txt

**Why:** Edits the sleek blue/red template; only label name + cleanroom scene change.

**Wire:**
- Before: `if_pen_scene` TRUE
- After: `merge_imagine_out` (Node 3)

**Test:** Pin a pen row, execute. Response should include an image URL. Pen hardware matches template; label shows today’s compound.

---

## Node 3 — `merge_imagine_out`

**Node type:** Merge

| Parameter | Value |
|---|---|
| Node name | `merge_imagine_out` |
| Mode | Append |
| Number of Inputs | 2 |
| Input 1 | `grok_imagine_pen_edit` |
| Input 2 | `GROK_Imagine` |

**Why:** One downstream path into `Save_render_URL` / Buffer.

**Wire:**
- Input 1: `grok_imagine_pen_edit`
- Input 2: `GROK_Imagine`
- After: existing `Save_render_URL` (move the old `GROK_Imagine` → `Save_render_URL` wire here)

**Test:** Lab/vial run still reaches `Save_render_URL`. Pen run also reaches `Save_render_URL`.

---

## Existing node edit — `GROK_Imagine`

Do **not** rename. Re-paste generations body (lab/vial + pen fallback):

https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/n8n-grok-imagine-body-feed.txt

URL stays: `https://api.x.ai/v1/images/generations`

---

## Templates used by Node 2

- Blue: https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/assets/pbv-research-pen-template-blue.png
- Red: https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/assets/pbv-research-pen-template-red.png
