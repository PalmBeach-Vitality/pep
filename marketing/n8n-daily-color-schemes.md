# Extreme daily visual reset (everything different)

Each weekday is a **different poster system**: color + pattern + layout + motif.

## Prep_day_variant — replace these fields (fx ON)

### `daily_color_scheme`
```text
{{ ({1:'Matte black #050505 + neon lime #B6FF3B + white',2:'Pure white #F7F7F5 + ink black #111111 + signal red #E11D48 accents',3:'Deep indigo #111827 + hot magenta #F472B6 + ice #E0F2FE',4:'Sandstone #E7E5E4 + espresso #1C1917 + copper #B45309',5:'Ocean #082F49 + aqua #2DD4BF + foam white',6:'Burgundy #4C0519 + gold #F5D0A0 + cream type',7:'Slate blue #0F172A + orange #FB923C + pale gray type'})[$now.weekday] || 'Matte black + neon lime + white' }}
```

### `daily_pattern`
```text
{{ ({1:'Diagonal hazard stripes faded in background',2:'Giant oversized typography as texture filling half the frame',3:'Isometric cube wireframe city of molecules',4:'Halftone print dots + torn-paper collage edges',5:'Concentric radar circles / sonar rings',6:'Vertical film-strip frames / storyboard gutters',7:'Cracked stone / mineral texture with clean type overlays'})[$now.weekday] || 'Diagonal abstract pattern' }}
```

### `daily_image_brief`
```text
{{ ({1:'Split poster: left solid color block with huge compound name, right motif zone',2:'Editorial magazine cover layout, name massive top, thin rules, lots of whitespace',3:'Centered badge/medallion composition with orbiting motif elements',4:'Bottom-heavy collage: type top-left, dense pattern lower two-thirds',5:'Top banner bar + clean center hero name + motif peeking corners',6:'Asymmetric diagonal divide; name on one side, motif on the other',7:'Full-bleed texture background with frosted glass card in center holding text'})[$now.weekday] || 'Split poster composition' }}
```

### `daily_visual_motif`
```text
{{ ({1:'Abstract crystalline shard cluster',2:'Bold stencil compound-name as graphic shape',3:'Floating geometric pen/capsule blueprint (no needles)',4:'Layered translucent circles like assay wells',5:'Folded blueprint ribbon / catalog folio shape',6:'Minimal research-use seal stamp graphic',7:'Faceted mineral + soft lens flare (abstract, not lifestyle)'})[$now.weekday] || 'Abstract crystalline shard cluster' }}
```

### keep existing
`day_of_week`, `daily_angle`, `daily_caption_mode`

---

## GROK_Imagine (1:1) — full Body fx ON

```text
{{ JSON.stringify({ model: 'grok-imagine-image-2.0', aspect_ratio: '1:1', n: 1, prompt: [
  'Generate a COMPLETELY DIFFERENT Palm Beach Vitality scientific social poster for today only. Do not reuse prior-day look.',
  'Square 1080x1080. Premium print design. High contrast. Distinctive.',
  'COLOR SYSTEM TODAY (must dominate): ' + String($('Prep_day_variant').item.json.daily_color_scheme) + '.',
  'PATTERN TODAY (must be obvious): ' + String($('Prep_day_variant').item.json.daily_pattern) + '.',
  'LAYOUT TODAY (must follow exactly): ' + String($('Prep_day_variant').item.json.daily_image_brief) + '.',
  'MOTIF TODAY (large, visible): ' + String($('Prep_day_variant').item.json.daily_visual_motif) + '.',
  'Weekday: ' + String($('Prep_day_variant').item.json.day_of_week || $now.weekdayLong) + '. Date mark: ' + $now.toISODate() + '.',
  'Exact headline: ' + String($('Parse_Grok').item.json.figma_headline || 'BPC-157') + '.',
  'Subhead: ' + String($('Parse_Grok').item.json.figma_subhead || '') + '.',
  'Three short bullets: ' + [ $('Parse_Grok').item.json.figma_bullet_1, $('Parse_Grok').item.json.figma_bullet_2, $('Parse_Grok').item.json.figma_bullet_3 ].filter(Boolean).join(' | ') + '.',
  'Include brand wordmark PALM BEACH VITALITY, CTA VIEW LABORATORY LISTING, and tiny disclaimer FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN USE.',
  'If two weekdays were placed side by side, a viewer must instantly see different color, pattern, and composition.',
  'Forbidden: repeating navy-teal default, people, syringes, needles, injections, gyms, clinics, lifestyle photography, misspelled chemical names.'
].join(' ') }) }}
```

## Grok_imagine_story
Same, `aspect_ratio: '9:16'`.

## Side-by-side test
Run twice with different forced weekdays if needed — images must not look like recolors of one template.
