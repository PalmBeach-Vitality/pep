# Daily color schemes for Grok Imagine

Add this field on **`Prep_day_variant`**, then use it in both Imagine nodes.

## 1) Prep_day_variant → `daily_color_scheme` (fx ON)

```text
{{ ({1:'Primary deep navy #071422, accent teal #2CB29D, white type, cool blue grid',2:'Primary charcoal #101820, accent ice blue #7DD3FC, white type, steel grid',3:'Primary ink green-black #0B1F1A, accent mint #34D399, off-white type, soft green grid',4:'Primary midnight #0A1024, accent electric cyan #22D3EE, white type, dense blueprint grid',5:'Primary graphite #151515, accent champagne gold #D4B483, warm white type, subtle gold haze',6:'Primary black #050505, accent silver #C0C7D1 with thin cyan #67E8F9, high-contrast mono scientific',7:'Primary deep navy #0A1628, accent coral-teal mix #2DD4BF with soft sand highlight #E8DCC8, calm premium catalog'})[$now.weekday] || 'Primary deep navy #071422, accent teal #2CB29D, white type' }}
```

## 2) Append into BOTH Imagine prompts (required line)

```text
'TODAY COLOR SCHEME (mandatory, dominate the whole image): ' + String($('Prep_day_variant').item.json.daily_color_scheme || '') + '. Do not reuse yesterday\'s accent color. Background, glow, rules, bullets, and CTA must match this scheme.'
```

## Week map
| Day | Feel |
|---|---|
| Mon | Navy / teal (core brand) |
| Tue | Charcoal / ice blue |
| Wed | Ink green / mint |
| Thu | Midnight / cyan |
| Fri | Graphite / champagne gold |
| Sat | Black / silver-cyan |
| Sun | Navy / teal-sand |

Still no lifestyle imagery; keep scientific poster style.
