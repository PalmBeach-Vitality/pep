# Dynamic spotlight images (new art every post)

Figma export only snapshots one fixed frame. To create a **new image per compound**, render from `Parse_Grok` fields (`figma_headline`, `figma_subhead`, bullets, CTA).

## Recommended chain

```
Parse_Grok
  → Build_spotlight_html   (Edit Fields)
  → Render_spotlight       (HTTP Request → Htmlcsstoimage)
  → Save_render_url        (Edit Fields)
  → Create a post          (Buffer)
```

**Disable for now:** `Wait`, `Figma_export`, `Resolve_Image`, `Save_figma_image`  
(keep them on the canvas; just toggle disabled)

---

## 1) Sign up (one time)

1. Go to [htmlcsstoimage.com](https://htmlcsstoimage.com) → create account  
2. Copy **User ID** + **API Key**  
3. In n8n: Credentials → **Header Auth** or use Basic Auth on the HTTP node (User ID = username, API Key = password)

Free tier is enough for weekly posts.

---

## 2) Add `Build_spotlight_html`

**After:** `Parse_Grok`  
**Before:** `Render_spotlight`  

Node type: **Edit Fields**  
Name: `Build_spotlight_html`  
Include Other Input Fields: **ON**

| Name | Mode | Value |
|---|---|---|
| `spotlight_html` | Expression | paste expression below |

### `spotlight_html` expression

```text
={{ `<!DOCTYPE html><html><head><meta charset="utf-8"/><link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet"/><style>:root{--navy:#0A1628;--teal:#0D9488;--sand:#F8F4EC;--muted:#8C9CAC;--white:#FFFFFF}*{box-sizing:border-box;margin:0;padding:0}body{width:1080px;height:1080px;background:radial-gradient(ellipse 70% 50% at 85% 10%,rgba(13,148,136,.22),transparent 55%),radial-gradient(ellipse 50% 40% at 5% 95%,rgba(13,148,136,.12),transparent 50%),linear-gradient(180deg,#0A1628 0%,#0D1B33 100%);color:var(--sand);font-family:Manrope,sans-serif;overflow:hidden;position:relative}body::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:54px 54px;pointer-events:none}.pad{position:relative;z-index:1;padding:70px 72px;height:100%;display:flex;flex-direction:column}.top{display:flex;justify-content:space-between;align-items:baseline}.brand{font-family:Syne,sans-serif;font-weight:700;font-size:28px;letter-spacing:.08em}.eyebrow{margin-top:18px;color:var(--teal);font-size:24px;font-weight:500}.form{color:var(--muted);font-size:22px;letter-spacing:.12em;text-transform:uppercase}.headline{margin-top:72px;font-family:Syne,sans-serif;font-weight:700;font-size:${(($json.figma_headline||'').length>18)?72:92}px;line-height:1.02;color:var(--white);max-width:920px}.rule{width:120px;height:4px;background:var(--teal);margin:28px 0 24px}.subhead{font-size:34px;line-height:1.3;max-width:860px}.bullets{list-style:none;margin-top:48px;display:flex;flex-direction:column;gap:18px}.bullets li{font-size:28px;padding-left:28px;position:relative}.bullets li::before{content:"";position:absolute;left:0;top:12px;width:10px;height:10px;border-radius:50%;background:var(--teal)}.bottom{margin-top:auto}.cta{display:inline-block;border:2px solid var(--teal);color:var(--teal);font-family:Syne,sans-serif;font-weight:600;font-size:26px;padding:16px 36px;margin-bottom:28px}.disclaimer{font-size:18px;line-height:1.4;color:var(--muted);max-width:920px}</style></head><body><div class="pad"><div class="top"><div><div class="brand">PALM BEACH VITALITY</div><div class="eyebrow">Laboratory research material</div></div><div class="form">${($json.product_form||'Pen')}</div></div><div class="headline">${($json.figma_headline||$json.compound_name||'').replace(/</g,'')}</div><div class="rule"></div><div class="subhead">${($json.figma_subhead||'').replace(/</g,'')}</div><ul class="bullets"><li>${($json.figma_bullet_1||'').replace(/</g,'')}</li><li>${($json.figma_bullet_2||'').replace(/</g,'')}</li><li>${($json.figma_bullet_3||'').replace(/</g,'')}</li></ul><div class="bottom"><div class="cta">${($json.figma_cta||'View laboratory listing').replace(/</g,'')}</div><div class="disclaimer">For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.</div></div></div></body></html>` }}
```

Preview: long HTML string starting with `<!DOCTYPE html>`.

> If `product_form` is missing on Parse_Grok, add it from Limit/Sheets:  
> `={{ $('Limit').item.json.product_form }}` as an extra field on Build, or pull Limit in the expression: `$('Limit').item.json.product_form`.

---

## 3) Add `Render_spotlight`

**After:** `Build_spotlight_html`  
**Before:** `Save_render_url`

Node type: **HTTP Request**  
Name: `Render_spotlight`

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://hcti.io/v1/image` |
| Authentication | Generic Credential Type → **Basic Auth** (User ID / API Key) |
| Send Body | **ON** |
| Body Content Type | JSON |
| Specify Body | Using Fields / JSON |

**JSON body** (Raw / expression), Content-Type `application/json`:

```text
={{ JSON.stringify({ html: $json.spotlight_html, google_fonts: 'Syne|Manrope', viewport_width: 1080, viewport_height: 1080 }) }}
```

Or fields:
| Name | Value |
|---|---|
| `html` | `={{ $json.spotlight_html }}` |
| `google_fonts` | `Syne\|Manrope` |
| `viewport_width` | `1080` |
| `viewport_height` | `1080` |

### Success output
```json
{
  "url": "https://hcti.io/v1/image/...."
}
```

That `url` is a **new PNG per run**, filled with this compound’s headline/bullets.

Settings tip: Retry On Fail ON, Always Output Data ON, On Error Continue (same as Figma).

---

## 4) Add `Save_render_url`

**After:** `Render_spotlight`  
**Before:** `Create a post`

Node type: **Edit Fields**  
Name: `Save_render_url`  
Include Other Input Fields: **ON** (or map captions from Parse_Grok)

| Name | Mode | Value |
|---|---|---|
| `figma_image_url` | Expression | `={{ $json.url }}` |
| `ig_caption_draft` | Expression | `={{ $('Parse_Grok').item.json.ig_caption_draft.replaceAll('\\n', '\n') }}` |

---

## 5) Buffer

In **Create a post**:
- Image URL: `={{ $json.figma_image_url }}`
- Text: `={{ $json.ig_caption_draft.replaceAll('\\n', '\n') }}`

---

## Test order (1 item only)

1. Confirm **Limit = 1** still before Grok  
2. Execute `Parse_Grok` → check `figma_headline` is this week’s compound  
3. Execute `Build_spotlight_html`  
4. Execute `Render_spotlight` → open `url` in browser — must show **that** compound name  
5. Execute `Save_render_url` → `Create a post`

---

## Designer alternative: Placid

If you prefer a visual template editor:
1. Rebuild the slide once in [Placid](https://placid.app)  
2. Name layers `headline`, `subhead`, `bullet_1`, `bullet_2`, `bullet_3`, `cta`, `product_form`  
3. n8n HTTP POST to Placid generate endpoint with those fields from Parse_Grok  

Same chain positions: **after Parse_Grok / before Create a post**.

---

## Offline / batch (optional)

Repo script (no n8n):

```bash
python3 marketing/scripts/generate_spotlight_png.py \
  --headline "TB-500" \
  --subhead "Actin-binding peptide" \
  --bullet "Actin-binding research peptide" \
  --bullet "Pre-filled research format" \
  --bullet "Laboratory research use only" \
  --product-form "Pen" \
  --out marketing/generated/tb-500-spotlight.png
```

Template source: `marketing/spotlight-card.html`
