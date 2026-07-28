# Grok Imagine prompt — match the premium PB Vitality card

Target look (from your reference):
- Deep navy + faint technical grid
- Soft hex / molecular pattern on the **right**
- Warm pale glow bottom-right
- Left-aligned big compound name
- Teal underline + teal bar bullets
- Centered brand with teal rules
- CTA with arrow
- Clean, premium, not a photo collage, not a flat empty slide

## Paste into `Grok_Imagine` JSON body (fx ON)

```text
{{ JSON.stringify({ model: 'grok-imagine-image-quality', aspect_ratio: '1:1', n: 1, prompt: [
  'Design a premium Palm Beach Vitality Instagram square graphic 1080x1080 that looks like a high-end scientific brand poster, NOT a photo of a lab and NOT a sparse PowerPoint slide.',
  'Exact art direction: deep navy background, subtle blueprint grid across the canvas, large soft translucent hexagonal molecular honeycomb pattern occupying the right side and fading left, gentle warm champagne glow in the bottom-right corner for depth.',
  'Layout: centered top brand lockup PALM BEACH VITALITY in small tracked caps with thin teal horizontal rules on both sides.',
  'Left side hierarchy: huge bold white condensed sans headline EXACT text: ' + String($json.figma_headline || $json.display_name || 'BPC-157').replace(/ Research Material/i,'') + '.',
  'Directly under headline a thick short teal underline. Then white subhead: ' + String($json.figma_subhead || 'Pentadecapeptide') + '.',
  'Then small tracked gray uppercase line: LABORATORY RESEARCH MATERIAL.',
  'Then three left-aligned lines with short vertical teal bars as bullets: 1) ' + String($json.figma_bullet_1 || 'Pentadecapeptide molecular class') + ' 2) ' + String($json.figma_bullet_2 || 'Pre-filled research format') + ' 3) ' + String($json.figma_bullet_3 || 'Laboratory research use only') + '.',
  'Lower left teal uppercase CTA with arrow: ' + String($json.figma_cta || 'VIEW LABORATORY LISTING').toUpperCase() + ' →',
  'Bottom centered small uppercase muted disclaimer: FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN USE OR CONSUMPTION.',
  'Typography must be crisp and correctly spelled. Color palette only navy, white, teal #2CB29D, soft warm glow. Generous padding, modern, luxurious, scientific.',
  'Avoid: people, syringes, gym, clinic, lifestyle, purple neon, cluttered icons, misspellings, stock photo product bottles, busy collages.'
].join(' ') }) }}
```

Execute `Grok_Imagine` and open the new URL.

For pixel-perfect repeatability later, use the HTML card in `marketing/spotlight-card.html` with Htmlcsstoimage (same layout every time).
