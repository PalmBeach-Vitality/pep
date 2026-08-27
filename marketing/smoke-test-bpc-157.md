# BPC-157 Smoke Test (Grok node)

## Goal
Confirm one-item flow + science/research-only caption for **P-BPC-001 / BPC-157** (pen).

## n8n setup for this test

1. Temporarily disconnect or disable the full-sheet path into Grok.
2. Before Grok, ensure **exactly 1 item**.
3. Easiest options:
   - **Limit = 1** after a Filter where `compound_id = P-BPC-001`, or
   - Pin the JSON below on **Edit Fields** / a Manual Trigger and run from there into Grok.

### Pin / test input (paste as item JSON)

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

### Optional Filter expression (keep only BPC-157)

- Field: `compound_id`
- Operation: equals
- Value: `P-BPC-001`

Then **Limit = 1** → Edit Fields → Grok.

---

## Pass criteria

| Check | Pass if |
|---|---|
| Item count | Grok output = **1 item** (not 24) |
| Name | Uses **BPC-157** only (no nicknames) |
| Science tone | Catalog / research-note style |
| Reframe | Does **not** push injury healing, recovery benefits, or human outcomes (even though sheet says “Recovery / Healing”) |
| Format | Mentions research vial/pre-filled research format neutrally |
| URL | Includes `https://www.palmbeach-vitality.store/products/bpc-157-pen` |
| Hashtags | Keeps `#BPC157`; no wellness hype tags required |
| Disclaimer | Exact close: `For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.` |
| `compliance_check.ok` | `true` |
| Banned words absent | no: treat, heal, dose, inject, patient, wellness, weight, recovery benefits, emoji |

---

## Where to look in Grok response

Parse path:

```text
choices[0].message.content  →  JSON string
```

Then inspect:

- `display_name`
- `platform_copy.instagram.caption`
- `platform_copy.facebook.caption`
- `platform_copy.tiktok.spoken_script`
- `creative_brief.headline` / `subhead` / `bullets`
- `compliance_check`

---

## After execute

Paste back:
1. Whether item count was 1
2. The IG caption text
3. `compliance_check` object

I’ll score pass/fail against the checklist.
