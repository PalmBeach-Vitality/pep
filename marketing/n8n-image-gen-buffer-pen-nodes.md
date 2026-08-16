# image_gen_buffer — pen lock without IF

Workflow: `image_gen_buffer`

No IF. No Merge. No second Imagine HTTP.

```text
… → if_compliance (or current node that feeds GROK_Imagine)
      → prep_imagine_request
      → GROK_Imagine
      → Save_render_URL
```

`prep_imagine_request` sets `imagine_url` + `imagine_body_string`:
- `pen_3ml_scene` → `POST /v1/images/edits` + blue or red template
- lab / vial → `POST /v1/images/generations`

If you already added `if_pen_scene` / `grok_imagine_pen_edit` / `merge_imagine_out`, delete them and use this instead.

Reply **node 1 ok** after Node 1.

---

## Node 1 — `prep_imagine_request`

**Node type:** Code

| Parameter | Value |
|---|---|
| Node name | `prep_imagine_request` |
| Mode | Run Once for All Items (or Run Once for Each Item — either is fine for 1 item) |
| Language | JavaScript |
| Include Other Input Fields | ON if available; the script also spreads `$json` |

**Code — paste entire file:**  
https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/n8n-prep-imagine-request.js

**Why:** One node decides edits vs generations. Avoids IF branch bugs.

**Wire:**
- Before: the node that currently feeds `GROK_Imagine` (usually `if_compliance` true, or `Parse_Grok`)
- After: existing `GROK_Imagine`
- Keep the rest of the chain as-is

**Test:** Execute `prep_imagine_request` only.
- Pen row → `imagine_mode` is `pen_edit_blue` or `pen_edit_red`; `imagine_url` ends with `/images/edits`; body has `image.url`
- Lab/vial → `imagine_mode` is `lab_or_vial_generate`; `imagine_url` ends with `/images/generations`; no `image` key

---

## Node 2 — `GROK_Imagine` (EDIT existing — do not create, do not rename)

**Node type:** HTTP Request (already exists)

Change only URL + body. Keep auth, headers, and downstream wire to `Save_render_URL`.

| Parameter | Value |
|---|---|
| Node name | `GROK_Imagine` (unchanged) |
| Method | POST |
| URL (fx ON) | `{{ $json.imagine_url }}` |
| Authentication | unchanged (xAI Header Auth / Bearer) |
| Send Headers | ON |
| Header | `Content-Type` = `application/json` |
| Send Body | ON |
| Body Content Type | JSON / Raw |
| Specify Body | Using Expression (fx ON) |
| Body (fx ON) | `{{ $json.imagine_body_string }}` |

**Do not** leave a hardcoded `/images/generations` URL. The Code node owns the path.

**Wire:** unchanged after this node (`Save_render_URL`).

**Test:**
1. Pin a Retatrutide / Semaglutide / Tirzepatide pen → blue template edit
2. Pin BPC-157 or PT-141 pen → red template edit
3. Pin a vial or lab row → generations, no pen template

---

## Templates (used only when Code sets edits)

- Blue: https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/assets/pbv-research-pen-template-blue.png
- Red: https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/assets/pbv-research-pen-template-red.png
