# Finish Grok Node (complete setup)

Final Grok section before Figma:

`Edit Fields (1 compound) → Code: Build Grok Body → HTTP Request: Grok → Code: Parse Grok → (IF compliance_ok) → Figma`

---

## 1) Code node — Build Grok Body

**Name:** `Build Grok Body`  
**Mode:** Run Once for Each Item  
**Paste this code:**

```javascript
const SYSTEM_PROMPT = `You write SCIENCE AND RESEARCH-ONLY captions for Palm Beach Vitality laboratory research materials.

Tone: technical, neutral, catalog-style. Like a compound listing note for researchers - not ads, not lifestyle content, not wellness content.

CAPTION MISSION:
Produce science/research-only copy. Every sentence must serve compound identification, biochemical class, laboratory format, documentation, or research-use restriction.

STRICT CONTENT ALLOWLIST (use only these):
1. Chemical / peptide name(s)
2. Laboratory research material format (research vial OR pre-filled research format)
3. Biochemical class / molecular descriptor from input (e.g. pentadecapeptide; GHRH analog; melanocortin receptor research ligand; GLP-1 receptor agonist research compound)
4. High-level in-vitro / laboratory research context (assay, pathway characterization, analytical reference) - no organism outcomes
5. Catalog link CTA for researchers
6. Hashtags using compound names + research tags only
7. Mandatory research-use disclaimer

STRICT DENYLIST (never write):
- Human use, consumption, patients, clinics, athletes, wellness, anti-aging
- Diagnose/treat/cure/prevent/heal/therapy/therapeutic/clinical use
- Weight, fat, appetite, glucose, blood sugar, muscle, injury recovery, libido, sexual function
- Structure/function claims about bodies
- Dosing, injection, reconstitution-for-administration, mcg/IU protocols
- Testimonials, before/after, results, guarantees
- Marketing hype: revolutionary, game-changing, unlock, transform, optimize your, glow-up, stack for gains
- Emojis
- Nicknames: KLOW, Wolverine, GLOW (and similar). Use chemical constituents only.

NAMING:
- display_name = chemical names only
- Overrides: KLOW -> KPV / BPC-157 / TB-500 / GHK-Cu; Wolverine / BPC-157/TB-500 (Wolverine) -> BPC-157 / TB-500; GLOW -> BPC-157 / TB-500 / GHK-Cu
- Hashtags: compound-name tags only; strip #KLOW #Wolverine #GLOW; prefer #ResearchPeptides #LaboratoryResearch #InVitroResearch plus compound tags

CAPTION STRUCTURE (follow exactly for IG + FB):
Line 1: display_name - laboratory research material
Line 2: biochemical class / molecular descriptor (from mechanism_1_liner, reframed scientifically)
Line 3: format note (research vial / pre-filled research format) + category as research class only (strip healing/wellness words)
Line 4: one in-vitro research context sentence (no human endpoints)
Line 5: CTA + canonical_url
Line 6: hashtags
Final lines: mandatory disclaimer exactly

CRITICAL DISCLAIMER RULE:
- Instagram caption MUST end with the mandatory disclaimer
- Facebook caption MUST end with the mandatory disclaimer
- TikTok caption MUST end with the mandatory disclaimer
- If any platform caption omits the disclaimer, set compliance_check.ok=false and add a flag

TIKTOK (still science/research only):
- hook = compound name + "research compound"
- on_screen_text = short science labels only (name, class, format, research use only)
- spoken_script = 12-20 seconds, catalog narration only

If sheet fields contain banned benefit language (recovery, wellness, healing, metabolic benefits), rewrite into science descriptors. If impossible without implying human use, set compliance_check.ok=false and list flags.

MANDATORY DISCLAIMER (exact text, must be the final lines on IG, FB, and TikTok captions):
For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.

Do not invent studies, purity %, approvals, certifications, prices, or facts not in input.

Output valid JSON only (no markdown):
{
  "compound_id": "string",
  "display_name": "string",
  "platform_copy": {
    "instagram": { "caption": "string", "first_comment": "Research-use catalog note only. Not for human use.", "alt_text": "string" },
    "facebook": { "caption": "string" },
    "tiktok": { "hook": "string", "on_screen_text": ["string"], "spoken_script": "string", "caption": "string" }
  },
  "creative_brief": {
    "headline": "string",
    "subhead": "string",
    "bullets": ["string", "string", "string"],
    "cta": "View laboratory listing",
    "figma_template_type": "string",
    "visual_notes": "Clean lab catalog visual. Compound name dominant. No lifestyle imagery. Include research-use only mark."
  },
  "compliance_check": { "ok": true, "flags": [] }
}

creative_brief rules:
- headline = display_name only (or display_name + Research Material)
- subhead = biochemical class only
- bullets = exactly: [molecular/class note, laboratory format, research-use restriction]
- no benefit language

Angle mapping (science only):
- Spotlight Hero -> identity + class + format
- Mechanism / Mechanism Carousel -> molecular class / pathway descriptor only
- 3-Bullet Benefits -> three research notes (class, format, restriction) - never human benefits
- FAQ -> What is this research material? / Who is it for? (laboratories only)
- Compare -> vial vs pre-filled research format only
- Wellness Angle -> ignore; use Trust/documentation science note instead
- Trust / Quality -> documentation / research-use standards only
- TikTok Reel Frame -> name + class + research-only beats`;

const compound = {
  compound_id: $json.compound_id,
  compound_name: $json.compound_name,
  category: $json.category,
  product_form: $json.product_form,
  short_tagline: $json.short_tagline,
  key_benefit_theme: $json.key_benefit_theme,
  mechanism_1_liner: $json.mechanism_1_liner,
  spotlight_angle: $json.spotlight_angle,
  figma_template_type: $json.figma_template_type,
  canonical_url: $json.canonical_url,
  hashtags_core: $json.hashtags_core,
  compliance_notes: $json.compliance_notes,
  disclaimer_short: $json.disclaimer_short,
  notes: $json.notes,
};

const userContent = [
  'Write science and research-only captions. Chemical names only. No marketing, no human-use language.',
  '',
  'IMPORTANT: Instagram, Facebook, and TikTok captions must ALL end with the mandatory disclaimer.',
  '',
  'compound:',
  JSON.stringify(compound, null, 2),
].join('\n');

const grok_request_body = {
  model: 'grok-3',
  temperature: 0.2,
  max_tokens: 900,
  response_format: { type: 'json_object' },
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ],
};

return [{
  json: {
    ...$json,
    grok_request_body,
    grok_request_body_string: JSON.stringify(grok_request_body),
  },
}];
```

---

## 2) HTTP Request — Grok (final settings)

Use **Raw body** (most reliable in n8n):

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.x.ai/v1/chat/completions` |
| Authentication | Header Auth / Bearer `YOUR_XAI_API_KEY` |
| Header `Content-Type` | `application/json` |
| Send Body | ON |
| Body Content Type | **Raw** |
| Body | expression (**fx**): `={{ $json.grok_request_body_string }}` |

Notes:
- Must include the leading `=`
- Do **not** use `JSON.stringify(...)` again in the HTTP node
- Do **not** paste the huge prompt into the HTTP node
- Execute **Build Grok Body** alone first and confirm `grok_request_body_string` starts with `{"model":"grok-3"`

---

## 3) Code node — Parse Grok

**Name:** `Parse Grok`  
**Mode:** Run Once for Each Item  
**Paste this code:**

```javascript
const DISCLAIMER = 'For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.';

const raw = $json.choices?.[0]?.message?.content ?? '';
let parsed;

try {
  parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
} catch (error) {
  return [{
    json: {
      compliance_ok: false,
      compliance_flags: `Invalid JSON from Grok: ${error.message}`,
      grok_raw: raw,
    },
  }];
}

const ig = parsed?.platform_copy?.instagram?.caption || '';
const fb = parsed?.platform_copy?.facebook?.caption || '';
const tt = parsed?.platform_copy?.tiktok?.caption || '';

const flags = [...(parsed?.compliance_check?.flags || [])];
if (!ig.includes(DISCLAIMER)) flags.push('IG missing mandatory disclaimer');
if (!fb.includes(DISCLAIMER)) flags.push('FB missing mandatory disclaimer');
if (!tt.includes(DISCLAIMER)) flags.push('TikTok missing mandatory disclaimer');

const compliance_ok = (parsed?.compliance_check?.ok === true) && flags.length === 0;

// Keep compound fields from earlier node if available
const prior = $('Build Grok Body').item?.json || {};

return [{
  json: {
    compound_id: parsed.compound_id || prior.compound_id,
    display_name: parsed.display_name || prior.compound_name,
    compound_name: prior.compound_name || parsed.display_name,
    product_form: prior.product_form,
    canonical_url: prior.canonical_url,
    figma_template_type: parsed?.creative_brief?.figma_template_type || prior.figma_template_type,

    ig_caption_draft: ig,
    ig_first_comment: parsed?.platform_copy?.instagram?.first_comment || '',
    ig_alt_text: parsed?.platform_copy?.instagram?.alt_text || '',

    fb_caption_draft: fb,

    tiktok_hook: parsed?.platform_copy?.tiktok?.hook || '',
    tiktok_on_screen_text: (parsed?.platform_copy?.tiktok?.on_screen_text || []).join(' | '),
    tiktok_script_draft: parsed?.platform_copy?.tiktok?.spoken_script || '',
    tiktok_caption: tt,

    figma_headline: parsed?.creative_brief?.headline || '',
    figma_subhead: parsed?.creative_brief?.subhead || '',
    figma_bullet_1: parsed?.creative_brief?.bullets?.[0] || '',
    figma_bullet_2: parsed?.creative_brief?.bullets?.[1] || '',
    figma_bullet_3: parsed?.creative_brief?.bullets?.[2] || '',
    figma_cta: parsed?.creative_brief?.cta || 'View laboratory listing',
    figma_visual_notes: parsed?.creative_brief?.visual_notes || '',

    compliance_ok,
    compliance_flags: flags.join('; '),
    grok_raw: raw,
  },
}];
```

---

## 4) IF node — compliance gate

Before Figma / Buffer:

- Condition: `{{ $json.compliance_ok }}` is `true`
- True → Figma
- False → stop / notify (do not post)

---

## Output fields ready for Figma

| Field | Use |
|---|---|
| `figma_headline` | Title layer |
| `figma_subhead` | Subhead layer |
| `figma_bullet_1` / `_2` / `_3` | Bullet layers |
| `figma_cta` | CTA layer |
| `figma_template_type` | Which Figma template to use |
| `display_name` | Compound name layer |
| `canonical_url` | QR / link text if needed |
| `ig_caption_draft` | Later Buffer caption |

---

## Quick verify

1. Edit Fields still has 1 BPC-157 item  
2. Execute `Build Grok Body` → confirm `grok_request_body` exists  
3. Execute Grok HTTP → success  
4. Execute `Parse Grok` → confirm flat fields + `compliance_ok: true`  

Then move to Figma.
