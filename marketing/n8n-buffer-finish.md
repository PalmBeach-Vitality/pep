# Buffer step — finish n8n spotlight flow

## Current chain
`Parse Grok → HTTP Figma → Edit Fields (Save Figma Image) → Buffer Create Post`

Shopify/hosting move for `palmbeach-vitality.store` is **later**. Keep using existing URLs in captions for now.

---

## 1) Edit Fields — Save Figma Image

After Figma HTTP node:

- Name: `Save Figma Image`
- Mode: Manual
- Include Other Input Fields: OFF

| Name | Mode | Value |
|---|---|---|
| `figma_image_url` | Expression | `={{ $json.images["2:51"] }}` |
| `ig_caption_draft` | Expression | `={{ $('Parse Grok').item.json.ig_caption_draft }}` |
| `fb_caption_draft` | Expression | `={{ $('Parse Grok').item.json.fb_caption_draft }}` |
| `tiktok_caption` | Expression | `={{ $('Parse Grok').item.json.tiktok_caption }}` |
| `compliance_ok` | Expression | `={{ $('Parse Grok').item.json.compliance_ok }}` |
| `figma_headline` | Expression | `={{ $('Parse Grok').item.json.figma_headline }}` |

> If your Parse node has a different exact name, use that name inside `$('...')`.

Execute and confirm `figma_image_url` starts with `https://`.

---

## 2) IF node (recommended)
Condition: `compliance_ok` is true  
True → Buffer  
False → stop

---

## 3) Buffer — Create a post

Your workflow already has **Create a post**. Wire it from Save Figma Image.

Typical Buffer / social fields:

| Buffer field | Value |
|---|---|
| Text / content | `={{ $json.ig_caption_draft }}` |
| Media / image URL | `={{ $json.figma_image_url }}` |
| Profile / channel | your IG (and/or FB) profile in Buffer |

### Smoke-test tips
- Start with **Instagram only**
- Prefer **draft / pending** if Buffer offers it (don’t auto-publish yet)
- Confirm image + caption look correct in Buffer before enabling schedule

### Facebook (optional second Buffer node or multi-profile)
- Text: `={{ $json.fb_caption_draft }}`
- Image: `={{ $json.figma_image_url }}`

---

## 4) Done checklist
- [ ] Figma returns image URL
- [ ] Save Figma Image flattens URL + captions
- [ ] Buffer draft created with image + research-only caption
- [ ] Disclaimer visible at end of caption
- [ ] No auto-publish until reviewed

After Buffer smoke test passes, n8n core path is finished. Then we can revisit Sheets rotation + host migration.
