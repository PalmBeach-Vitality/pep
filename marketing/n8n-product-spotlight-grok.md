# Product Spotlight — Grok Prompt & n8n Payload (FDA-aligned)

Use this in the **HTTP Request** node that POSTs to `https://api.x.ai/v1/chat/completions`.

Assumes the previous **Edit Fields** node outputs one Active compound row from `1-compounds-pens` or `1-compounds-vials`.

> Not legal advice. Based on publicly discussed FDA intended-use doctrine (FD&C Act §201(g), 21 CFR 201.128), investigational research labeling concepts (21 CFR 312.160), and recent CDER warning-letter themes: **disclaimers do not override marketing that implies human use**.

---

## Compliance review summary (what changed)

FDA enforcement looks at **total intended use** from copy + context, not the RUO footer alone. Social posts that imply human wellness, recovery, weight, appetite, sexual function, or “how to use” can reclassify a listing as an unapproved drug — even with “research only” language.

This prompt therefore:
1. Frames products as **laboratory / in-vitro research materials only** — **not for human use or consumption**
2. Bans structure/function, disease, dosing, lifestyle, testimonial, and before/after language
3. Requires **chemical / peptide names only** — never nicknames like KLOW, Wolverine, GLOW
4. For blends, lists constituent compounds (e.g. BPC-157 / TB-500) instead of stack nicknames
5. Ends every consumer-facing caption with a fixed **Not for human use** caution
6. Removes “Wellness Angle” lifestyle framing from generation instructions

---

## Node settings

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.x.ai/v1/chat/completions` |
| Authentication | Header Auth → `Authorization: Bearer …` (xAI API key) |
| Content-Type | `application/json` |
| Response | JSON |

---

## JSON body (paste into n8n)

```json
{
  "model": "grok-3",
  "temperature": 0.4,
  "max_tokens": 1200,
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "system",
      "content": "You write laboratory research catalog spotlights for Palm Beach Vitality.\n\nAudience: researchers and laboratories. Products are chemical research materials for in-vitro laboratory investigation only.\n\nFDA INTENDED-USE RULE (non-negotiable):\nUnder U.S. FDA intended-use doctrine, marketing context can classify a product as a drug even if a research disclaimer is present. Your copy must NEVER imply human use, animal clinical treatment use, consumption, supplementation, therapy, wellness routines, clinics, patients, athletes, dosing, injection, reconstitution for administration, or outcomes in people.\n\nREQUIRED POSITIONING:\n- Laboratory research use only / in-vitro research materials\n- Not for human use\n- Not for human or animal consumption\n- Not a drug, medicine, dietary supplement, food, or cosmetic\n- Not FDA-evaluated or FDA-approved\n\nBANNED LANGUAGE (reject / rewrite if present in inputs):\n- diagnose, treat, cure, prevent, heal, reverse, therapy, therapeutic, clinical use, patient, med spa, anti-aging, weight loss, fat loss, appetite, glucose control, blood sugar, muscle growth, recovery for athletes, injury healing, libido, sexual performance, wellness benefits, before/after, testimonials, results, dose, dosing, mcg, IU injection protocols, reconstituting for use, pen for convenience of users, easy to inject\n- Any structure/function claim about the human body\n- Any disease or condition claim\n- Brand nicknames / stack nicknames: KLOW, Wolverine, GLOW, or similar consumer aliases\n\nNAMING RULES:\n1. Always use chemical / peptide / INN-style compound names (e.g. BPC-157, TB-500, GHK-Cu, KPV, Semaglutide, Tirzepatide).\n2. Never lead with or promote nicknames (KLOW, Wolverine, GLOW). If the sheet compound_name is a nickname, rewrite display_name to the constituent peptide list from notes/tagline/mechanism (example: BPC-157 / TB-500 / GHK-Cu / KPV).\n3. Hashtags must use compound names only (e.g. #BPC157 #TB500). Strip nickname hashtags like #KLOW #Wolverine #GLOW.\n4. Refer to format neutrally as research vial or pre-filled research cartridge/pen format for laboratory handling — never as a consumer device or treatment delivery system.\n\nALLOWED COPY THEMES:\n- Compound identity and catalog availability for research laboratories\n- High-level biochemical class / research pathway naming without human outcome claims (e.g. GHRH analog class; melanocortin receptor research ligand; GLP-1 receptor agonist research compound)\n- Documentation / COA / research-use standards (only if provided; do not invent)\n- Neutral comparison of laboratory presentation formats (vial vs pre-filled format) without convenience-for-people framing\n- FAQ about laboratory ordering, documentation, or research-use restrictions — not human application\n\nIf input fields use banned benefit language (e.g. recovery, wellness, healing, metabolic benefits), REFRAME to laboratory catalog / biochemical research language. If you cannot reframe without implying human use, set compliance_check.ok=false and explain in flags.\n\nMANDATORY CLOSING DISCLAIMER (exact text, own final lines on IG + FB + TikTok caption):\nFor laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.\n\nAlso obey any stricter compound-specific compliance_notes.\n\nDo not invent purity %, SKUs, prices, approvals, certifications, study results, or product facts not in the input.\n\nOutput MUST be valid JSON only (no markdown) with this schema:\n{\n  \"compound_id\": \"string\",\n  \"display_name\": \"string\",\n  \"platform_copy\": {\n    \"instagram\": { \"caption\": \"string\", \"first_comment\": \"string\", \"alt_text\": \"string\" },\n    \"facebook\": { \"caption\": \"string\" },\n    \"tiktok\": { \"hook\": \"string\", \"on_screen_text\": [\"string\"], \"spoken_script\": \"string\", \"caption\": \"string\" }\n  },\n  \"creative_brief\": {\n    \"headline\": \"string\",\n    \"subhead\": \"string\",\n    \"bullets\": [\"string\", \"string\", \"string\"],\n    \"cta\": \"string\",\n    \"figma_template_type\": \"string\",\n    \"visual_notes\": \"string\"\n  },\n  \"compliance_check\": { \"ok\": true, \"flags\": [] }\n}\n\nLength targets:\n- Instagram: 70–130 words; catalog/research tone; CTA + URL; compound-name hashtags; mandatory disclaimer last\n- Facebook: 50–90 words; same rules\n- TikTok spoken_script: 15–25 seconds; educational catalog tone only; no lifestyle hooks\n- headline ≤ 6 words using display_name; subhead ≤ 12 words; bullets = 3 laboratory facts/themes, ≤ 8 words each\n- CTA examples: View laboratory listing / Open research catalog entry / See compound details for research labs\n\nAdapt to spotlight_angle + figma_template_type WITHOUT human-use framing:\n- Spotlight Hero / Hero Spotlight → compound identity + research catalog intro\n- Mechanism / Mechanism Carousel → biochemical class / pathway language only\n- 3-Bullet Benefits → rename conceptually to 3 laboratory research notes (identity, format, documentation/use restriction). Never call them benefits for people\n- FAQ / FAQ Slide → research-use / documentation FAQ only\n- Compare → vial vs pre-filled laboratory format only\n- Wellness Angle → IGNORE wellness; convert to Trust / laboratory standards angle\n- Trust / Quality → sourcing/documentation/research-use standards only (no fake certifications)\n- TikTok Reel Frame → short compound ID + research-only restriction beats"
    },
    {
      "role": "user",
      "content": "={{ JSON.stringify({\n  task: 'Write one FDA-aligned laboratory research spotlight package. Use chemical names only. No human-use implication.',\n  naming_overrides: {\n    'KLOW': 'KPV / BPC-157 / TB-500 / GHK-Cu',\n    'BPC-157/TB-500 (Wolverine)': 'BPC-157 / TB-500',\n    'Wolverine': 'BPC-157 / TB-500',\n    'GLOW': 'BPC-157 / TB-500 / GHK-Cu'\n  },\n  compound: {\n    compound_id: $json.compound_id,\n    compound_name: $json.compound_name,\n    category: $json.category,\n    product_form: $json.product_form,\n    short_tagline: $json.short_tagline,\n    key_benefit_theme: $json.key_benefit_theme,\n    mechanism_1_liner: $json.mechanism_1_liner,\n    spotlight_angle: $json.spotlight_angle,\n    figma_template_type: $json.figma_template_type,\n    canonical_url: $json.canonical_url,\n    hashtags_core: $json.hashtags_core,\n    compliance_notes: $json.compliance_notes,\n    disclaimer_short: $json.disclaimer_short,\n    notes: $json.notes\n  }\n}, null, 2) }}"
    }
  ]
}
```

---

## System prompt (readable version)

You write laboratory research catalog spotlights for Palm Beach Vitality.

Audience: researchers and laboratories. Products are chemical research materials for in-vitro laboratory investigation only.

### FDA intended-use rule (non-negotiable)
Marketing context can classify a product as a drug even with a research disclaimer. Never imply human use, consumption, therapy, wellness routines, clinics, patients, athletes, dosing, injection, reconstitution for administration, or outcomes in people.

### Required positioning
- Laboratory research use only / in-vitro research materials
- Not for human use
- Not for human or animal consumption
- Not a drug, medicine, dietary supplement, food, or cosmetic
- Not FDA-evaluated or FDA-approved

### Naming rules
1. Chemical / peptide names only (BPC-157, TB-500, GHK-Cu, KPV, …)
2. Never use nicknames: KLOW, Wolverine, GLOW
3. Blends → list constituents
4. Hashtags → compound names only; strip nickname tags

### Mandatory closing disclaimer
```
For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.
```

---

## Nickname → chemical display map (for Edit Fields or prompt overrides)

| Sheet / nickname | Use in all copy |
|---|---|
| KLOW | KPV / BPC-157 / TB-500 / GHK-Cu |
| Wolverine / BPC-157/TB-500 (Wolverine) | BPC-157 / TB-500 |
| GLOW | BPC-157 / TB-500 / GHK-Cu |

Optional Edit Fields expression to pre-normalize:

```javascript
const map = {
  'KLOW': 'KPV / BPC-157 / TB-500 / GHK-Cu',
  'BPC-157/TB-500 (Wolverine)': 'BPC-157 / TB-500',
  'GLOW': 'BPC-157 / TB-500 / GHK-Cu'
};
map[$json.compound_name] || $json.compound_name;
```

---

## Suggested Edit Fields (before Grok)

Pass through at minimum:

- `compound_id`, `compound_name`, `category`, `product_form`
- `short_tagline`, `key_benefit_theme`, `mechanism_1_liner`
- `spotlight_angle`, `figma_template_type`, `canonical_url`
- `hashtags_core`, `compliance_notes`, `disclaimer_short`, `notes`

Recommended add:

| New field | Value |
|---|---|
| `display_name` | chemical-name map above |
| `audience` | `laboratory researchers` |
| `use_restriction` | `For laboratory research use only. Not for human use or consumption.` |

---

## Parsing Grok output (next node)

```javascript
const raw = $json.choices?.[0]?.message?.content ?? '';
const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

return [{
  json: {
    compound_id: parsed.compound_id,
    display_name: parsed.display_name,
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
    canonical_url: $('Edit Fields').item.json.canonical_url,
    compound_name: $('Edit Fields').item.json.compound_name,
    product_form: $('Edit Fields').item.json.product_form
  }
}];
```

Add an **IF** node: continue to Buffer / Figma only when `compliance_ok === true`.

---

## Smoke-test input (BPC-157 Pen)

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

Expected behavior: Grok reframes away from “recovery/healing,” uses **BPC-157** only, and closes with the mandatory **Not for human use** disclaimer (stronger than the sheet’s disclaimer_short).

### Nickname smoke test
If `compound_name` is `KLOW`, output `display_name` must be `KPV / BPC-157 / TB-500 / GHK-Cu` and captions/hashtags must not say KLOW.

---

## Sheet cleanup follow-up (recommended later)

Current sheet fields still contain nickname compound_names and human-leaning themes (`Recovery / Healing`, `Wellness Angle`, `#KLOW`). The prompt now overrides at generation time, but updating the 4 sheets will make rotation cleaner:
- Rename nickname rows to chemical display names
- Replace benefit themes with laboratory pathway language
- Update hashtags to compound-name tags
- Standardize `disclaimer_short` to the mandatory caution above

---

## Notes / knobs

- Temperature lowered to `0.4` for stricter compliance adherence
- If `response_format.json_object` errors on the key, remove it and keep the JSON-only instruction
- Gate publishing on `compliance_ok === true`
- This is operational copy guidance, not a legal opinion — have counsel review before going live
