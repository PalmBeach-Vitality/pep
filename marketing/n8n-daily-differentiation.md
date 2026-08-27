# Force visibly different daily posts (same compound)

Temperature alone won’t fix this — the caption **template** is too rigid. Use stronger per-day modes.

## 1) Replace `Prep_day_variant` fields

Keep Include Other Input Fields **ON**.

### `day_of_week`
```text
{{ $now.weekdayLong }}
```

### `daily_angle`
```text
{{ ({1:'Identity / catalog listing',2:'Biochemical class / mechanism descriptor',3:'Laboratory format (pen or vial)',4:'In-vitro research context',5:'Documentation / catalog reference',6:'Research-use clarification (FAQ)',7:'Quality / laboratory sourcing frame'})[$now.weekday] || 'Identity / catalog listing' }}
```

### `daily_image_brief`
```text
{{ ({1:'Hero name TOP-LEFT huge; sparse hex RIGHT; minimal bullets',2:'Emphasize CLASS word as giant subhead; hex denser RIGHT; teal bars thicker',3:'FORMAT-focused: put PEN/VIAL as secondary hero under name; glow BOTTOM-LEFT instead of bottom-right',4:'ASSAY/in-vitro framing: schematic grid stronger; smaller headline; larger subhead about in-vitro context',5:'DOCUMENTATION/CTA dominant: big CTA arrow; headline medium; catalog-reference mood',6:'FAQ/disclaimer-forward: disclaimer larger; headline still clear; calmer quieter composition',7:'QUALITY frame: centered brand heavier; elegant wide spacing; soft glow stronger bottom-right'})[$now.weekday] || 'Hero name with cinematic lab atmosphere' }}
```

### `daily_caption_mode`
```text
{{ ({1:'Open with compound identity + catalog framing. Focus on what the material is.',2:'Open with biochemical class. Make molecular descriptor the star. Do not lead with format.',3:'Open with laboratory format (pen/vial/pre-filled research format). Class is secondary.',4:'Open with in-vitro / assay / analytical reference context. Avoid repeating identity-only openings.',5:'Open with documentation / catalog listing CTA emphasis. Research-use clarity second.',6:'Open with research-use clarification FAQ tone. Explicit not-for-human-use early, still end with full disclaimer.',7:'Open with laboratory quality / sourcing neutrality. No hype. Calm technical trust framing.'})[$now.weekday] || 'Open with compound identity.' }}
```

---

## 2) Replace `user_prompt` (Edit Fields before Grok)

```text
{{ 'Write science and research-only captions. Chemical names only. No marketing, no human-use language.\n\nHARD RULES:\n- IG, FB, TikTok captions MUST all end with the mandatory disclaimer.\n- Today: ' + String($json.day_of_week || $now.weekdayLong).trim() + ' / ' + $now.toISODate() + '\n- Angle: ' + String($json.daily_angle).trim() + '\n- Caption mode: ' + String($json.daily_caption_mode).trim() + '\n- Image brief: ' + String($json.daily_image_brief).trim() + '\n\nDIFFERENTIATION (mandatory):\n- This post must be OBVIOUSLY different from other weekdays for the same compound.\n- Follow today\'s Caption mode exactly for the opening and emphasis.\n- Do not reuse sentence patterns from a generic catalog blurb.\n- Include exact marker in IG + FB: Catalog note — ' + $now.toISODate() + '\n- creative_brief.headline = chemical name + a short phrase reflecting today\'s angle (not the same headline every day).\n- creative_brief.subhead and bullets must also reflect today\'s angle.\n- creative_brief.visual_notes must describe a layout matching today\'s Image brief.\n\ncompound:\n' + JSON.stringify({ compound_id: $('Limit').item.json.compound_id, compound_name: $('Limit').item.json.compound_name, category: $('Limit').item.json.category, product_form: $('Limit').item.json.product_form, short_tagline: $('Limit').item.json.short_tagline, key_benefit_theme: $('Limit').item.json.key_benefit_theme, mechanism_1_liner: $('Limit').item.json.mechanism_1_liner, spotlight_angle: $json.daily_angle, figma_template_type: $('Limit').item.json.figma_template_type, canonical_url: $('Limit').item.json.canonical_url, hashtags_core: $('Limit').item.json.hashtags_core, compliance_notes: $('Limit').item.json.compliance_notes, disclaimer_short: $('Limit').item.json.disclaimer_short, notes: $('Limit').item.json.notes, day_of_week: String($json.day_of_week || $now.weekdayLong).trim(), daily_angle: $json.daily_angle, daily_image_brief: $json.daily_image_brief, daily_caption_mode: $json.daily_caption_mode, catalog_note_date: $now.toISODate() }, null, 2) }}
```

---

## 3) Append to BOTH Imagine prompts

Add at end of the prompt array/string:

```text
CRITICAL UNIQUE DAY DIRECTION: {{ String($('Prep_day_variant').item.json.daily_image_brief || $json.daily_image_brief || '') }}. Composition must clearly follow that direction. Tiny date text: {{ $now.toISODate() }}. Do not produce the same layout as other weekdays.
```

---

## 4) Verify after one run
- `daily_caption_mode` present on Prep  
- IG opening line matches today’s mode  
- `Catalog note — 2026-07-29` in caption  
- `figma_headline` not identical to yesterday  
- Image composition follows today’s brief  
