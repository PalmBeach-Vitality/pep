# FIX: Figma_export (and never-empty image URL)

**Working constants**
- File key: `cVeMEJnU12e8QdjfOystrl`
- Frame node id: `2020:5` (from Figma link `node-id=2020-5`) — **not** `2:51`
- Header name: `X-Figma-Token` (not Bearer)
- This week compound: **TB-500** fallback PNG (stable):
  `https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/grok-spotlight-prompt-7786/marketing/tb-500-hero-spotlight.png`

---

## Do this in n8n (order matters)

### A) Harden `Figma_export`

Open **Figma_export** → Parameters:

| Setting | Value |
|---|---|
| Method | `GET` |
| URL | `https://api.figma.com/v1/images/cVeMEJnU12e8QdjfOystrl` |
| Authentication | None |
| Send Headers | **ON** |
| Send Query Parameters | **ON** |
| Send Body | **OFF** |

**Header** (Fixed):

| Name | Value |
|---|---|
| `X-Figma-Token` | your Figma personal access token |

**Query** (all **Fixed**, not expression):

| Name | Value |
|---|---|
| `ids` | `2020:5` |
| `format` | `png` |
| `scale` | `2` |

**Settings** tab on the same node:

| Setting | Value |
|---|---|
| Retry On Fail | **ON** |
| Max Tries | `3` |
| Wait Between Tries | `60000` |
| On Error | **Continue Regular Output** |

> On Error Continue keeps the workflow alive when Figma 429s. Downstream Resolve picks the GitHub PNG.

**Wait** node immediately before `Figma_export`: **30–60 seconds** (Fixed).

---

### B) Replace brittle Save with `Resolve_image`

Add / rename an **Edit Fields** node after `Figma_export`.

**Name:** `Resolve_image`  
**Include Other Input Fields:** ON (if available)

| Name | Type | Value mode | Value |
|---|---|---|---|
| `figma_image_url` | String | Expression | see below |
| `ig_caption_draft` | String | Expression | `={{ $('Parse_Grok').item.json.ig_caption_draft.replaceAll('\\n', '\\n').replaceAll('\\\\n', '\\n') }}` |
| `fb_caption_draft` | String | Expression | `={{ $('Parse_Grok').item.json.fb_caption_draft }}` |
| `compound_name` | String | Expression | `={{ $('Parse_Grok').item.json.compound_name \|\| $('Limit').item.json.compound_name }}` |
| `compound_id` | String | Expression | `={{ $('Parse_Grok').item.json.compound_id \|\| $('Limit').item.json.compound_id }}` |

**`figma_image_url` expression** (copy exactly — Figma first, else TB-500 / BPC-157 GitHub PNG):

```text
={{ ($json.images && ($json.images['2020:5'] || Object.values($json.images).find(u => !!u))) || (($('Parse_Grok').item.json.compound_name || $('Limit').item.json.compound_name || '').toString().toLowerCase().includes('tb-500') && !($('Parse_Grok').item.json.compound_name || '').toString().toLowerCase().includes('bpc-157') ? 'https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/grok-spotlight-prompt-7786/marketing/tb-500-hero-spotlight.png' : 'https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/grok-spotlight-prompt-7786/marketing/bpc-157-hero-spotlight.png') }}
```

Simpler **TB-500-only** version if the expression above is hard to paste:

```text
={{ ($json.images && $json.images['2020:5']) || 'https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/grok-spotlight-prompt-7786/marketing/tb-500-hero-spotlight.png' }}
```

Preview of `figma_image_url` **must** start with `https://`. If it is empty/null, you are still reading the wrong field.

---

### C) Buffer Create a post

| Field | Value |
|---|---|
| Text / caption | `={{ $json.ig_caption_draft.replaceAll('\\n', '\n') }}` |
| Image URL | `={{ $json.figma_image_url }}` |

Connect Buffer from **`Resolve_image`**, not from raw `Figma_export`.

Disable **Download_figma_image** for now (it fails when Figma URL is null). Stable GitHub/raw URLs work directly in Buffer.

---

## One-shot test (TB-500 week)

1. Run up through **Limit** → confirm TB-500 (or your Active pick).
2. Run **Parse_Grok** → confirm captions + `compliance_ok`.
3. Run **Wait** once (do not spam).
4. Run **Figma_export** once.
   - Success: `"images":{"2020:5":"https://figma-alpha-api..."}`
   - 429 / error with On Error Continue: item still passes — OK
   - `"2020:5": null`: wrong node id — re-copy from Figma (`node-id=2020-5` → `2020:5`)
5. Run **Resolve_image** → `figma_image_url` is https.
6. Run **Create a post** → image + caption in Buffer.

**If still 429:** stop clicking Figma for 20–30 minutes. The fallback PNG still posts.

---

## Common breaks (quick check)

| Symptom | Cause | Fix |
|---|---|---|
| `too many requests` | Figma rate limit | Wait 20–30 min; Retry On Fail 60s; don’t re-execute |
| `"2020:5": null` or `"2:51": null` | Wrong / stale frame id | Use `ids=2020:5` Fixed |
| `URL empty` on Download | Upstream image null | Use Resolve_image fallback; skip Download |
| `Referenced node doesn't exist` | Wrong `$('Node Name')` | Use exact canvas name (`Parse_Grok`) via picker |
| Buffer no image | Temp Figma S3 URL | Prefer GitHub raw fallback URL |
| Query `ids` looks like `2020-5` | Hyphen from Figma UI link | Must be colon: `2020:5` |

---

## Optional: skip Figma entirely this week

1. Disable `Figma_export` + Wait + Download.
2. Add Edit Fields **Resolve_image** after Parse_Grok.
3. Set `figma_image_url` **Fixed** to the TB-500 raw URL above.
4. Buffer uses `={{ $json.figma_image_url }}`.

You can re-enable Figma later once the token is off cooldown.
