# Figma HTTP node — Hero Spotlight smoke test

From link:
`https://www.figma.com/slides/cVeMEJnU12e8QdjfOystrl/Untitled?node-id=2-51...`

| Piece | Value |
|---|---|
| File key | `cVeMEJnU12e8QdjfOystrl` |
| Node id (API) | `2:51` (from `2-51`) |

## Chain
`Parse Grok → HTTP Figma Export → Edit Fields (Figma Image URL) → Buffer`

Optional: IF `compliance_ok` is true before Figma.

---

## 1) HTTP Request — Figma Export

| Setting | Value |
|---|---|
| Method | `GET` |
| URL | `https://api.figma.com/v1/images/cVeMEJnU12e8QdjfOystrl` |
| Authentication | None (use header token) |
| Send Headers | ON |
| Send Query | ON |
| Send Body | OFF |

### Header
| Name | Value |
|---|---|
| `X-Figma-Token` | your Figma personal access token |

### Query parameters
| Name | Value |
|---|---|
| `ids` | `2:51` |
| `format` | `png` |
| `scale` | `2` |

### Expected response
```json
{
  "err": null,
  "images": {
    "2:51": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/..."
  }
}
```

If `images["2:51"]` is `null`, the node id is wrong or the slide isn’t exportable.

---

## 2) Edit Fields — save image URL

Name: `Save Figma Image`  
Mode: Manual  
Include Other Input Fields: **ON** (keep captions from Parse Grok)

If Include Other Fields can’t see Parse Grok data (HTTP replaces item), use expressions from Parse Grok node by name, or merge nodes.

### Simple path (if data from Parse is lost)
Add a **Merge** node earlier, or map captions again from `$('Parse Grok')`.

Recommended fields:

| Name | Value |
|---|---|
| `figma_image_url` | `={{ $json.images["2:51"] }}` |
| `ig_caption_draft` | `={{ $('Parse Grok').item.json.ig_caption_draft }}` |
| `fb_caption_draft` | `={{ $('Parse Grok').item.json.fb_caption_draft }}` |
| `figma_headline` | `={{ $('Parse Grok').item.json.figma_headline }}` |
| `compliance_ok` | `={{ $('Parse Grok').item.json.compliance_ok }}` |
| `canonical_url` | `={{ $('Parse Grok').item.json.canonical_url }}` |

> Use your exact Parse node name in `$('...')`.

---

## 3) Verify
1. Execute Figma HTTP  
2. Confirm `images["2:51"]` is a real HTTPS URL  
3. Open that URL in a browser — should show the slide PNG  
4. Execute Save Figma Image — confirm `figma_image_url` is set  

Then we wire Buffer Create Post.
