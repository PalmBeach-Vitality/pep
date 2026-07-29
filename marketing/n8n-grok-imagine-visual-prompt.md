# Stronger daily image differentiation

Captions can differ while images still look alike if Imagine keeps the same layout every day. Force composition changes.

## GROK_Imagine (1:1 feed) — Body fx ON

```text
{{ JSON.stringify({ model: 'grok-imagine-image-quality', aspect_ratio: '1:1', n: 1, prompt: [
  'Premium Palm Beach Vitality Instagram square 1080x1080 scientific brand poster.',
  'Brand system only: deep navy, teal #2CB29D, white type, faint blueprint grid, translucent hex molecular pattern, soft champagne glow.',
  'NOT a photo of a real lab. NOT a sparse empty text slide. NOT the same layout every day.',
  'TODAY IS ' + String($('Prep_day_variant').item.json.day_of_week || $now.weekdayLong) + ' (' + $now.toISODate() + ').',
  'MANDATORY UNIQUE LAYOUT FOR TODAY: ' + String($('Prep_day_variant').item.json.daily_image_brief || '') + '.',
  'Follow that layout instruction exactly. If it says glow BOTTOM-LEFT, glow must be bottom-left. If it says PEN as secondary hero, show PEN/format wording large under the compound name.',
  'Headline EXACT: ' + String($('Parse_Grok').item.json.figma_headline || JSON.parse($('GROK_HTTP').item.json.choices[0].message.content).creative_brief.headline || 'BPC-157') + '.',
  'Subhead: ' + String($('Parse_Grok').item.json.figma_subhead || JSON.parse($('GROK_HTTP').item.json.choices[0].message.content).creative_brief.subhead || '') + '.',
  'Bullets: ' + [ $('Parse_Grok').item.json.figma_bullet_1, $('Parse_Grok').item.json.figma_bullet_2, $('Parse_Grok').item.json.figma_bullet_3 ].filter(Boolean).join(' | ') + '.',
  'CTA: VIEW LABORATORY LISTING →',
  'Tiny date in corner: ' + $now.toISODate() + '.',
  'Disclaimer small: FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN USE.',
  'Top brand: PALM BEACH VITALITY with teal rules.',
  'Make this weekday OBVIOUSLY different from other weekdays: change dominant hierarchy, hex density, glow corner, and headline scale per today\'s brief.',
  'No people, syringes, gym, clinic, lifestyle, purple neon, misspellings.'
].join(' ') }) }}
```

## Grok_imagine_story (9:16) — Body fx ON

Same prompt, only change:

```text
aspect_ratio: '9:16'
```

And add:

```text
'Vertical story crop 9:16. Keep today\'s unique layout readable in tall format.'
```

## Also confirm Parse maps creative brief
If `figma_headline` is empty, add Parse fields from `creative_brief.*` or the expression above falls back to GROK_HTTP JSON.

## Verify
Two days should not share the same glow corner / hierarchy. Wednesday must show format/PEN emphasis + bottom-left glow.
