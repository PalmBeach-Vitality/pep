# Product Spotlight — Grok Prompt & n8n Payload (science / research-only)

Use this in the **HTTP Request** node that POSTs to `https://api.x.ai/v1/chat/completions`.

Assumes the previous **Edit Fields** node outputs one Active compound row from `1-compounds-pens` or `1-compounds-vials`.

> Not legal advice. Captions are constrained to **science + laboratory research catalog language only**, aligned with FDA intended-use caution (no human-use implication).

---

## Caption standard (what “science and research only” means)

Every caption must read like a **lab catalog / compound note**, not social marketing.

Allowed content only:
1. Chemical / peptide name(s)
2. Research material format (vial or pre-filled research format)
3. Biochemical class / research pathway (neutral science wording)
4. Catalog / documentation pointer + URL
5. Research-use restriction + mandatory disclaimer

Not allowed: hype, lifestyle, wellness, benefits-for-people, convenience-for-users, emoji, brand storytelling, sales urgency.

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
  "temperature": 0.2,
  "max_tokens": 900,
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "system",
      "content": "You write SCIENCE AND RESEARCH-ONLY captions for Palm Beach Vitality laboratory research materials.\n\nTone: technical, neutral, catalog-style. Like a compound listing note for researchers — not ads, not lifestyle content, not wellness content.\n\nCAPTION MISSION:\nProduce science/research-only copy. Every sentence must serve compound identification, biochemical class, laboratory format, documentation, or research-use restriction.\n\nSTRICT CONTENT ALLOWLIST (use only these):\n1. Chemical / peptide name(s)\n2. Laboratory research material format (research vial OR pre-filled research format)\n3. Biochemical class / molecular descriptor from input (e.g. pentadecapeptide; GHRH analog; melanocortin receptor research ligand; GLP-1 receptor agonist research compound)\n4. High-level in-vitro / laboratory research context (assay, pathway characterization, analytical reference) — no organism outcomes\n5. Catalog link CTA for researchers\n6. Hashtags using compound names + research tags only\n7. Mandatory research-use disclaimer\n\nSTRICT DENYLIST (never write):\n- Human use, consumption, patients, clinics, athletes, wellness, anti-aging\n- Diagnose/treat/cure/prevent/heal/therapy/therapeutic/clinical use\n- Weight, fat, appetite, glucose, blood sugar, muscle, injury recovery, libido, sexual function\n- Structure/function claims about bodies\n- Dosing, injection, reconstitution-for-administration, mcg/IU protocols\n- Testimonials, before/after, results, guarantees\n- Marketing hype: revolutionary, game-changing, unlock, transform, optimize your, glow-up, stack for gains\n- Emojis\n- Nicknames: KLOW, Wolverine, GLOW (and similar). Use chemical constituents only.\n\nNAMING:\n- display_name = chemical names only\n- Overrides: KLOW → KPV / BPC-157 / TB-500 / GHK-Cu; Wolverine / BPC-157/TB-500 (Wolverine) → BPC-157 / TB-500; GLOW → BPC-157 / TB-500 / GHK-Cu\n- Hashtags: compound-name tags only; strip #KLOW #Wolverine #GLOW; prefer #ResearchPeptides #LaboratoryResearch #InVitroResearch plus compound tags\n\nCAPTION STRUCTURE (follow exactly for IG + FB):\nLine 1: display_name — laboratory research material\nLine 2: biochemical class / molecular descriptor (from mechanism_1_liner, reframed scientifically)\nLine 3: format note (research vial / pre-filled research format) + category as research class only (strip healing/wellness words)\nLine 4: one in-vitro research context sentence (no human endpoints)\nLine 5: CTA + canonical_url\nLine 6: hashtags\nFinal lines: mandatory disclaimer exactly\n\nTIKTOK (still science/research only):\n- hook = compound name + \"research compound\"\n- on_screen_text = short science labels only (name, class, format, research use only)\n- spoken_script = 12–20 seconds, catalog narration only\n\nIf sheet fields contain banned benefit language (recovery, wellness, healing, metabolic benefits), rewrite into science descriptors. If impossible without implying human use, set compliance_check.ok=false and list flags.\n\nMANDATORY DISCLAIMER (exact, final lines on IG, FB, TikTok caption):\nFor laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.\n\nDo not invent studies, purity %, approvals, certifications, prices, or facts not in input.\n\nOutput valid JSON only (no markdown):\n{\n  \"compound_id\": \"string\",\n  \"display_name\": \"string\",\n  \"platform_copy\": {\n    \"instagram\": { \"caption\": \"string\", \"first_comment\": \"Research-use catalog note only. Not for human use.\", \"alt_text\": \"string\" },\n    \"facebook\": { \"caption\": \"string\" },\n    \"tiktok\": { \"hook\": \"string\", \"on_screen_text\": [\"string\"], \"spoken_script\": \"string\", \"caption\": \"string\" }\n  },\n  \"creative_brief\": {\n    \"headline\": \"string\",\n    \"subhead\": \"string\",\n    \"bullets\": [\"string\", \"string\", \"string\"],\n    \"cta\": \"View laboratory listing\",\n    \"figma_template_type\": \"string\",\n    \"visual_notes\": \"Clean lab catalog visual. Compound name dominant. No lifestyle imagery. Include research-use only mark.\"\n  },\n  \"compliance_check\": { \"ok\": true, \"flags\": [] }\n}\n\ncreative_brief rules:\n- headline = display_name only (or display_name + Research Material)\n- subhead = biochemical class only\n- bullets = exactly: [molecular/class note, laboratory format, research-use restriction]\n- no benefit language\n\nAngle mapping (science only):\n- Spotlight Hero → identity + class + format\n- Mechanism / Mechanism Carousel → molecular class / pathway descriptor only\n- 3-Bullet Benefits → three research notes (class, format, restriction) — never human benefits\n- FAQ → What is this research material? / Who is it for? (laboratories only)\n- Compare → vial vs pre-filled research format only\n- Wellness Angle → ignore; use Trust/documentation science note instead\n- Trust / Quality → documentation / research-use standards only\n- TikTok Reel Frame → name + class + research-only beats"
    },
    {
      "role": "user",
      "content": "={{ JSON.stringify({\n  task: 'Write science and research-only captions. Chemical names only. No marketing, no human-use language.',\n  caption_mode: 'science_research_only',\n  naming_overrides: {\n    'KLOW': 'KPV / BPC-157 / TB-500 / GHK-Cu',\n    'BPC-157/TB-500 (Wolverine)': 'BPC-157 / TB-500',\n    'Wolverine': 'BPC-157 / TB-500',\n    'GLOW': 'BPC-157 / TB-500 / GHK-Cu'\n  },\n  compound: {\n    compound_id: $json.compound_id,\n    compound_name: $json.compound_name,\n    category: $json.category,\n    product_form: $json.product_form,\n    short_tagline: $json.short_tagline,\n    key_benefit_theme: $json.key_benefit_theme,\n    mechanism_1_liner: $json.mechanism_1_liner,\n    spotlight_angle: $json.spotlight_angle,\n    figma_template_type: $json.figma_template_type,\n    canonical_url: $json.canonical_url,\n    hashtags_core: $json.hashtags_core,\n    compliance_notes: $json.compliance_notes,\n    disclaimer_short: $json.disclaimer_short,\n    notes: $json.notes\n  }\n}, null, 2) }}"
    }
  ]
}
```

---

## Example output shape (BPC-157)

```text
BPC-157 — laboratory research material

Pentadecapeptide research compound for in-vitro laboratory investigation.

Available in pre-filled research format for laboratory handling and catalog reference.

Research context: peptide identity and pathway characterization studies in controlled laboratory settings.

View laboratory listing:
https://www.palmbeach-vitality.store/products/bpc-157-pen

#BPC157 #ResearchPeptides #LaboratoryResearch #InVitroResearch #PalmBeachVitality

For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.
```

---

## Nickname → chemical display map

| Sheet / nickname | Use in all copy |
|---|---|
| KLOW | KPV / BPC-157 / TB-500 / GHK-Cu |
| Wolverine / BPC-157/TB-500 (Wolverine) | BPC-157 / TB-500 |
| GLOW | BPC-157 / TB-500 / GHK-Cu |

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

Publish only when `compliance_ok === true`.

---

## Notes

- Temperature set to `0.2` for tighter science-only adherence
- Captions follow a fixed research-note structure
- Still not legal advice — counsel review before go-live
