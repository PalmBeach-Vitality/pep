# Grok Imagine — richer spotlight visuals

Replace the bland text-card prompt in **`Grok_Imagine`** with the body below.

Keep FDA rules: laboratory / in-vitro only. No people injecting, clinics, athletes, wellness, before/after, or disease claims. Chemical name must appear spelled correctly.

---

## Grok_Imagine JSON body (fx ON)

```text
{{ JSON.stringify({ model: 'grok-imagine-image-quality', aspect_ratio: '1:1', n: 1, prompt: [
  'Premium Instagram square 1080x1080 brand campaign still for Palm Beach Vitality.',
  'NOT a plain text slide. NOT a flat PowerPoint card. NOT sparse empty navy with only typography.',
  'Cinematic laboratory photography mood: deep navy and charcoal environment, soft teal accent lighting (#0D9488), shallow depth of field, subtle haze, reflective glass, premium product-catalog atmosphere.',
  'Background must feel rich: dark lab bench, frosted glassware, abstract molecular / helix light motifs, gentle caustic reflections, micro-grid or technical schematic faintly in the distance. High-end pharma-research aesthetic, tasteful, not cluttered.',
  'Foreground: elegant typography overlay integrated into the scene.',
  'Top: PALM BEACH VITALITY in refined small caps.',
  'Eyebrow: Laboratory research material.',
  'Hero headline EXACT spelling: ' + String($json.figma_headline || $json.display_name || 'Research material') + '.',
  'Subhead: ' + String($json.figma_subhead || '') + '.',
  'Short research notes (clean, minimal): ' + [ $json.figma_bullet_1, $json.figma_bullet_2, $json.figma_bullet_3 ].filter(Boolean).join(' · ') + '.',
  'CTA: ' + String($json.figma_cta || 'View laboratory listing') + '.',
  'Tiny bottom disclaimer: For laboratory research use only. Not for human use.',
  'Visual direction for today: ' + String($json.daily_image_brief || $('Prep_day_variant').item.json.daily_image_brief || 'hero compound name with cinematic lab atmosphere') + '.',
  'Style references: luxury scientific brand photography, Vogue-lab editorial lighting, crisp, modern, high contrast, atmospheric, beautiful bokeh.',
  'Strictly avoid: people, hands, injections, gyms, clinics, smiles, lifestyle, supplements bottles marketing cliches, neon cyberpunk overload, purple gradients, emojis, misspelled chemical names, medical claim graphics.'
].join(' ') }) }}
```

Optional cheaper model: change `grok-imagine-image-quality` → `grok-imagine-image`.

---

## After updating
1. Execute `Parse_Grok` → `Grok_Imagine`  
2. Open the new `data[0].url`  
3. If still too text-heavy, run once more (Imagine varies) or add to prompt: `Typography understated; background photography dominates 70% of the frame.`

---

## Daily variety
`Prep_day_variant.daily_image_brief` already changes by weekday, so backgrounds should shift (mechanism day vs format day vs FAQ day) while staying on-brand.
