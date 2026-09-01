# Fix: Grok HTTP body was `undefined`

## What the screenshot shows
1. Body expression `{{ $json.grok_request_body_string }}` evaluates to **undefined**
2. Body Content Type was set as an **expression** (`raw`) — it should be a fixed dropdown value
3. xAI then rejects the bad body

## Recommended fix (most reliable): replace HTTP Request with one Code node

Use this chain:

`Edit Fields → Call Grok (Code) → Parse Grok (Code) → IF compliance_ok → Figma`

### A) Edit Fields JSON
Keep your BPC-157 fields and **add your xAI key**:

```json
{
  "compound_id": "P-BPC-001",
  "compound_name": "BPC-157",
  "category": "Recovery / Healing",
  "product_form": "Pen",
  "short_tagline": "BPC-157 recovery research pen",
  "key_benefit_theme": "Tissue recovery research",
  "mechanism_1_liner": "Pentadecapeptide BPC-157",
  "spotlight_angle": "Spotlight Hero",
  "figma_template_type": "Hero Spotlight",
  "canonical_url": "https://www.palmbeach-vitality.store/products/bpc-157-pen",
  "hashtags_core": "#BPC157 #PeptidePen #RecoveryResearch #PalmBeachVitality",
  "compliance_notes": "Avoid injury cure language",
  "disclaimer_short": "For research and educational purposes only. Not intended to diagnose or treat any condition.",
  "notes": "20mg 3mL Pen",
  "xai_api_key": "PASTE_YOUR_XAI_KEY_HERE"
}
```

### B) Code node `Call Grok`
1. Disconnect / disable the failing HTTP Request node for now
2. Add Code node after Edit Fields
3. Name it `Call Grok`
4. Paste code from `marketing/n8n-code-call-grok.js`
5. Execute

This Code node builds the prompt and POSTs to xAI directly (no Raw/JSON body expression issues).

### C) Then add `Parse Grok`
Paste `marketing/n8n-code-parse-grok.js`  
Update the prior-node reference if needed:

```javascript
const prior = $('Edit Fields').item?.json || $('Call Grok').item?.json || {};
```

(Current parser looks for `$('Build Grok Body')` — if you skip that node, change it to `$('Edit Fields')`.)

---

## If you still want HTTP Request instead

Reset these to **Fixed** (not expression):

| Field | Mode | Value |
|---|---|---|
| Body Content Type | Fixed dropdown | `Raw` |
| Content Type | Fixed text | `application/json` |
| Header Content-Type | Fixed text | `application/json` |

Body field:
- Expression mode
- Value: `{{ $json.grok_request_body_string }}`
- Preview under the field must show JSON starting with `{"model":"grok-3"` — **not** `undefined`

If preview is `undefined`:
1. Open HTTP node **INPUT**
2. Confirm previous node is **Build Grok Body**
3. Confirm input has `grok_request_body_string`
4. If missing, re-paste updated Build Grok Body code and execute that node first

**Recommendation:** use `Call Grok` Code node. It’s simpler and stable.
