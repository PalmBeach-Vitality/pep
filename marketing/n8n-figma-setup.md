# Figma step (after Parse Grok)

## Chain
`Parse Grok → IF compliance_ok → HTTP Figma (export image) → Buffer Create Post`

## What Parse Grok already gives Figma
| Field | Use |
|---|---|
| `figma_headline` | Title text |
| `figma_subhead` | Subhead text |
| `figma_bullet_1/2/3` | Bullet layers |
| `figma_cta` | CTA |
| `figma_template_type` | Which frame to export |
| `display_name` | Compound name |
| `ig_caption_draft` / `fb_caption_draft` | Captions for Buffer later |

## Important Figma API limit
Figma REST API can **export frames as images**. It does **not** easily rewrite text layers and re-render unless you already use a plugin/tool for that.

So we have 2 paths:

### Path A — Template export (matches your current GET Figma node)
Pre-build frames in Figma named by template type, export the matching frame as PNG.

Templates from the sheet:
- Hero Spotlight
- Mechanism Carousel
- 3-Bullet Benefits
- FAQ Slide
- TikTok Reel Frame

### Path B — Dynamic text render (later)
Use a render tool (Placid / Bannerbear / Creatomate) fed by `figma_headline` etc.

**Start with Path A** if those frames already exist.

---

## Path A — n8n HTTP Request (Figma export)

### Headers
| Name | Value |
|---|---|
| `X-Figma-Token` | `YOUR_FIGMA_TOKEN` |

### Request
| Setting | Value |
|---|---|
| Method | `GET` |
| URL | `https://api.figma.com/v1/images/FILE_KEY` |
| Send Query Parameters | ON |

Query params:
| Name | Value |
|---|---|
| `ids` | node id for the template frame (e.g. `12:34`) |
| `format` | `png` |
| `scale` | `2` |

Response includes:
```json
{ "images": { "12:34": "https://figma-alpha-api.s3.../..." } }
```

### Next Edit Fields
Map:
- `figma_image_url` = `={{ $json.images["12:34"] }}`

Then Buffer uses `figma_image_url` + `ig_caption_draft`.

---

## What I need from you to wire this now
1. Figma file link (or file key)
2. Do you already have frames for: Hero Spotlight / Mechanism Carousel / etc.?
3. Figma personal access token (keep in n8n credentials; don’t paste in chat if possible)
4. Node IDs for each template frame (right-click frame in Figma → Copy link — contains `node-id=`)

For BPC-157 smoke test we only need the **Hero Spotlight** frame node id.
