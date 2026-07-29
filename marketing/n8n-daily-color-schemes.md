# Different image + color every day

## Prep_day_variant — add/replace these 3 fields (fx ON)

### `daily_color_scheme`
```text
{{ ({1:'Primary deep navy #071422, accent teal #2CB29D, white type, cool blue grid',2:'Primary charcoal #101820, accent ice blue #7DD3FC, white type, steel grid',3:'Primary ink green-black #0B1F1A, accent mint #34D399, off-white type, soft green grid',4:'Primary midnight #0A1024, accent electric cyan #22D3EE, white type, dense blueprint grid',5:'Primary graphite #151515, accent champagne gold #D4B483, warm white type, subtle gold haze',6:'Primary black #050505, accent silver #C0C7D1 with thin cyan #67E8F9, high-contrast mono scientific',7:'Primary deep navy #0A1628, accent coral-teal #2DD4BF with soft sand highlight #E8DCC8, calm premium catalog'})[$now.weekday] || 'Primary deep navy #071422, accent teal #2CB29D, white type' }}
```

### `daily_image_brief`
```text
{{ ({1:'Hero name TOP-LEFT huge; sparse hex RIGHT; minimal bullets; identity poster',2:'Giant CLASS/subhead typography; denser hex RIGHT; teal/ice bars thicker; mechanism poster',3:'FORMAT poster: huge PEN/VIAL word as secondary hero under name; glow BOTTOM-LEFT; format icons as abstract geometry only',4:'ASSAY poster: stronger schematic grid; molecular orbit lines; smaller headline; larger in-vitro subhead',5:'DOCUMENTATION poster: big CTA arrow; medium headline; catalog-card framing; file/document abstract shapes (no readable fake docs)',6:'FAQ poster: larger disclaimer band; calmer open space; quiet composition; research-use clarification focus',7:'QUALITY poster: centered elegant brand lockup; wide spacing; soft premium glow; minimal bullets'})[$now.weekday] || 'Hero scientific poster' }}
```

### `daily_visual_motif`
```text
{{ ({1:'Abstract glass ampoule silhouette + clean identity lockup',2:'Abstract molecular lattice / bond diagram (no fake study claims)',3:'Abstract pre-filled pen geometry / capsule outline (no injection imagery)',4:'Abstract waveform + assay plate grid motif',5:'Abstract catalog card / clipped blueprint sheet motif',6:'Abstract shield-outline research-use mark (not medical cross)',7:'Abstract precision caliper / quality-seal geometry (non-regulatory)'})[$now.weekday] || 'Abstract scientific geometry' }}
```

---

## GROK_Imagine body (fx ON) — 1:1 feed

```text
{{ JSON.stringify({ model: 'grok-imagine-image-quality', aspect_ratio: '1:1', n: 1, prompt: [
  'Create a BRAND NEW Palm Beach Vitality scientific poster image for Instagram 1080x1080.',
  'This must look like a different design from every other weekday — different color, different layout, different motif.',
  'COLOR SCHEME (mandatory): ' + String($('Prep_day_variant').item.json.daily_color_scheme) + '.',
  'LAYOUT (mandatory): ' + String($('Prep_day_variant').item.json.daily_image_brief) + '.',
  'VISUAL MOTIF (mandatory, make it prominent in the background/side art): ' + String($('Prep_day_variant').item.json.daily_visual_motif) + '.',
  'Day: ' + String($('Prep_day_variant').item.json.day_of_week || $now.weekdayLong) + ' / ' + $now.toISODate() + '.',
  'Headline EXACT: ' + String($('Parse_Grok').item.json.figma_headline || 'BPC-157') + '.',
  'Subhead: ' + String($('Parse_Grok').item.json.figma_subhead || '') + '.',
  'Bullets: ' + [ $('Parse_Grok').item.json.figma_bullet_1, $('Parse_Grok').item.json.figma_bullet_2, $('Parse_Grok').item.json.figma_bullet_3 ].filter(Boolean).join(' | ') + '.',
  'Brand top: PALM BEACH VITALITY. CTA: VIEW LABORATORY LISTING →. Tiny date ' + $now.toISODate() + '. Small disclaimer: FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN USE.',
  'Style: premium scientific brand poster, sharp typography, atmospheric depth.',
  'Strictly avoid: same navy-teal default if today is not Monday, people, syringes, needles, injections, gym, clinic, lifestyle, misspelled chemical names, purple neon spam, generic repeated layout.'
].join(' ') }) }}
```

## Grok_imagine_story
Same prompt, set `aspect_ratio: '9:16'` and add: `Tall 9:16 story crop; keep motif and hierarchy readable.`

## Success check
Wed vs Tue should differ in:
1. colors (mint/green vs ice blue)
2. layout (PEN/format vs class)
3. motif (pen geometry vs molecular lattice)
