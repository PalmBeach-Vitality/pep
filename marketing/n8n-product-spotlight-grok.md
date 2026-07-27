# Product Spotlight — Grok Prompt & n8n Payload

Use this in the **HTTP Request** node that POSTs to `https://api.x.ai/v1/chat/completions`.

Assumes the previous **Edit Fields** node outputs one Active compound row from `1-compounds-pens` or `1-compounds-vials`.

---

## Node settings

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.x.ai/v1/chat/completions` |
| Authentication | Header Auth → `Authorization: Bearer {{$credentials.xaiApi.apiKey}}` (or n8n Header Auth) |
| Content-Type | `application/json` |
| Response | JSON |

---

## JSON body (paste into n8n)

Set the HTTP body to **JSON** and use expressions. Replace field names if your Edit Fields node renames them.

```json
{
  "model": "grok-3",
  "temperature": 0.7,
  "max_tokens": 1200,
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "system",
      "content": "You are the social content writer for Palm Beach Vitality (Palm Beach Peptides).\n\nBrand voice: premium, clinical-clean, confident, research-forward. Short sentences. No hype slang. No emoji spam (max 1 emoji total across all outputs, optional).\n\nHard compliance rules — NEVER violate:\n1. Research / educational use only. Never claim diagnose, treat, cure, prevent, heal, or reverse any condition.\n2. No dosage / administration / injection instructions.\n3. No before/after body claims, weight-loss guarantees, sexual performance claims, or disease language.\n4. Obey compound-specific compliance_notes exactly.\n5. Always end IG and FB captions with the provided disclaimer_short on its own line.\n6. Do not invent product facts, SKUs, prices, or purity % not given in the input.\n7. Blend products stay one spotlight — do not tease splitting compounds into separate posts.\n8. Hashtags: use hashtags_core only; you may add at most 2 extra brand-safe research tags if needed.\n\nOutput MUST be valid JSON only (no markdown fences) with this exact schema:\n{\n  \"compound_id\": \"string\",\n  \"platform_copy\": {\n    \"instagram\": {\n      \"caption\": \"string\",\n      \"first_comment\": \"string\",\n      \"alt_text\": \"string\"\n    },\n    \"facebook\": {\n      \"caption\": \"string\"\n    },\n    \"tiktok\": {\n      \"hook\": \"string\",\n      \"on_screen_text\": [\"string\"],\n      \"spoken_script\": \"string\",\n      \"caption\": \"string\"\n    }\n  },\n  \"creative_brief\": {\n    \"headline\": \"string\",\n    \"subhead\": \"string\",\n    \"bullets\": [\"string\", \"string\", \"string\"],\n    \"cta\": \"string\",\n    \"figma_template_type\": \"string\",\n    \"visual_notes\": \"string\"\n  },\n  \"compliance_check\": {\n    \"ok\": true,\n    \"flags\": []\n  }\n}\n\nLength targets:\n- Instagram caption: 90–160 words, line breaks for readability, CTA + URL near end, then hashtags, then disclaimer.\n- Facebook caption: 60–110 words, slightly more conversational, include URL inline, disclaimer at end.\n- TikTok spoken_script: 20–35 seconds (~55–90 words). hook = first 1–2 seconds. on_screen_text = 3–5 short phrases matching the template style.\n- creative_brief.headline: max 6 words. subhead: max 12 words. bullets: 3 items, max 8 words each.\n- CTA always drives to the product page (canonical_url), soft research framing (e.g. Explore the research listing / View compound details).\n\nAdapt copy to spotlight_angle + figma_template_type:\n- Spotlight Hero / Hero Spotlight → bold compound intro + 1 key theme + soft CTA\n- Mechanism / Mechanism Carousel → mechanism_1_liner explained plainly in research language\n- 3-Bullet Benefits → three research themes (not medical benefits)\n- FAQ / FAQ Slide → one common research question + clear educational answer\n- Compare → form/context comparison only (e.g. pen vs vial convenience) without superiority medical claims\n- Wellness Angle → lifestyle-adjacent research curiosity, still compliant\n- Trust / Quality → sourcing, documentation, research-use standards (no fake certifications)\n- TikTok Reel Frame → punchy hook + fast educational beats"
    },
    {
      "role": "user",
      "content": "={{ JSON.stringify({\n  task: 'Write one product spotlight package for this compound.',\n  compound: {\n    compound_id: $json.compound_id,\n    compound_name: $json.compound_name,\n    category: $json.category,\n    product_form: $json.product_form,\n    short_tagline: $json.short_tagline,\n    key_benefit_theme: $json.key_benefit_theme,\n    mechanism_1_liner: $json.mechanism_1_liner,\n    spotlight_angle: $json.spotlight_angle,\n    figma_template_type: $json.figma_template_type,\n    canonical_url: $json.canonical_url,\n    hashtags_core: $json.hashtags_core,\n    compliance_notes: $json.compliance_notes,\n    disclaimer_short: $json.disclaimer_short,\n    notes: $json.notes\n  }\n}, null, 2) }}"
    }
  ]
}
```

---

## System prompt (readable version)

You are the social content writer for Palm Beach Vitality (Palm Beach Peptides).

Brand voice: premium, clinical-clean, confident, research-forward. Short sentences. No hype slang. No emoji spam (max 1 emoji total across all outputs, optional).

Hard compliance rules — NEVER violate:
1. Research / educational use only. Never claim diagnose, treat, cure, prevent, heal, or reverse any condition.
2. No dosage / administration / injection instructions.
3. No before/after body claims, weight-loss guarantees, sexual performance claims, or disease language.
4. Obey compound-specific `compliance_notes` exactly.
5. Always end IG and FB captions with the provided `disclaimer_short` on its own line.
6. Do not invent product facts, SKUs, prices, or purity % not given in the input.
7. Blend products stay one spotlight — do not tease splitting compounds into separate posts.
8. Hashtags: use `hashtags_core` only; you may add at most 2 extra brand-safe research tags if needed.

Output MUST be valid JSON only with schema:

```json
{
  "compound_id": "string",
  "platform_copy": {
    "instagram": {
      "caption": "string",
      "first_comment": "string",
      "alt_text": "string"
    },
    "facebook": {
      "caption": "string"
    },
    "tiktok": {
      "hook": "string",
      "on_screen_text": ["string"],
      "spoken_script": "string",
      "caption": "string"
    }
  },
  "creative_brief": {
    "headline": "string",
    "subhead": "string",
    "bullets": ["string", "string", "string"],
    "cta": "string",
    "figma_template_type": "string",
    "visual_notes": "string"
  },
  "compliance_check": {
    "ok": true,
    "flags": []
  }
}
```

---

## Suggested Edit Fields (before Grok)

Keep/pass through at minimum:

- `compound_id`
- `compound_name`
- `category`
- `product_form`
- `short_tagline`
- `key_benefit_theme`
- `mechanism_1_liner`
- `spotlight_angle`
- `figma_template_type`
- `canonical_url`
- `hashtags_core`
- `compliance_notes`
- `disclaimer_short`
- `notes`

Optional convenience fields to add in Edit Fields:

| New field | Expression idea |
|---|---|
| `brand_name` | `Palm Beach Vitality` |
| `form_label` | Pen → `pre-filled research pen` / Vial → `research vial` |

---

## Parsing Grok output (next node)

After the HTTP Request, add a **Code** node (or another Edit Fields) to flatten JSON for Buffer + Sheets writeback:

```javascript
const raw = $json.choices?.[0]?.message?.content ?? '';
const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

return [{
  json: {
    compound_id: parsed.compound_id,
    ig_caption_draft: parsed.platform_copy.instagram.caption,
    ig_first_comment: parsed.platform_copy.instagram.first_comment,
    ig_alt_text: parsed.platform_copy.instagram.alt_text,
    fb_caption_draft: parsed.platform_copy.facebook.caption,
    tiktok_hook: parsed.platform_copy.tiktok.hook,
    tiktok_on_screen_text: (parsed.platform_copy.tiktok.on_screen_text || []).join(' | '),
    tiktok_script_draft: parsed.platform_copy.tiktok.spoken_script,
    tiktok_caption: parsed.platform_copy.tiktok.caption,
    figma_headline: parsed.creative_brief.headline,
    figma_subhead: parsed.creative_brief.subhead,
    figma_bullets: (parsed.creative_brief.bullets || []).join(' | '),
    figma_cta: parsed.creative_brief.cta,
    figma_template_type: parsed.creative_brief.figma_template_type,
    figma_visual_notes: parsed.creative_brief.visual_notes,
    compliance_ok: parsed.compliance_check?.ok ?? false,
    compliance_flags: (parsed.compliance_check?.flags || []).join('; '),
    // pass-through from earlier node if merged
    canonical_url: $('Edit Fields').item.json.canonical_url,
    compound_name: $('Edit Fields').item.json.compound_name,
    product_form: $('Edit Fields').item.json.product_form
  }
}];
```

> If your Edit Fields node has a different name, update `$('Edit Fields')` accordingly. Or use a Merge node before Buffer.

---

## Smoke-test input (BPC-157 Pen)

Use this as a manual pin/test payload for the user message `compound` object:

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
  "notes": "20mg 3mL Pen"
}
```

---

## Notes / knobs

- Model: `grok-3` preferred for quality; `grok-2-latest` is fine if that’s what’s enabled on the key.
- If `response_format.json_object` errors on your account, remove it and keep the “JSON only” instruction in the system prompt.
- For carousel/FAQ templates, `creative_brief.bullets` / `on_screen_text` feed Figma text layers next.
- Gate Buffer publishing on `compliance_ok === true` (IF node) before Create a post.
