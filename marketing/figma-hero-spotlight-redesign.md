# Figma redesign — Hero Spotlight (post-ready)

Rebuild frame `2:51` in:
`https://www.figma.com/slides/cVeMEJnU12e8QdjfOystrl`

Goal: replace the “Product Review / Feature Name” placeholder with a real science/research catalog slide.

---

## Brand rules (match Grok compliance)
- Science / laboratory catalog only
- Chemical names only (BPC-157)
- No wellness, recovery claims, lifestyle imagery, emojis
- Include research-use mark on the slide

### Colors
| Token | Hex |
|---|---|
| Navy | `#0A1628` |
| Teal accent | `#0D9488` |
| Sand | `#F8F4EC` |
| White | `#FFFFFF` |
| Muted text | `#5B6B7C` |

### Type
- Display / compound name: strong geometric sans (e.g. Neue Haas / Satoshi / Inter Tight) — avoid default Inter if you have a better brand font
- Body: clean sans

### Size
- Instagram: **1080 × 1080**

---

## Layer structure (name layers exactly)

1. `bg`
2. `brand` → `Palm Beach Vitality`
3. `eyebrow` → `Laboratory research material`
4. `headline` → `BPC-157`
5. `subhead` → `Pentadecapeptide`
6. `accent_line` (teal rule under headline)
7. `bullet_1` → `Pentadecapeptide molecular class`
8. `bullet_2` → `Pre-filled research format`
9. `bullet_3` → `Laboratory research use only`
10. `cta` → `View laboratory listing`
11. `disclaimer` → `For laboratory research use only. Not for human use or consumption.`

---

## BPC-157 smoke-test copy (paste into layers)

```text
Palm Beach Vitality

Laboratory research material

BPC-157

Pentadecapeptide

• Pentadecapeptide molecular class
• Pre-filled research format
• Laboratory research use only

View laboratory listing

For laboratory research use only. Not for human use or consumption.
```

---

## Layout (one composition)
- Top: brand
- Center hero: **BPC-157** dominant
- One subhead + 3 research notes
- Bottom: CTA + disclaimer
- No cards, no badges, no photo collage
- Subtle grid / soft gradient only — compound name is the visual anchor

---

## Reference asset
A generated reference PNG is in the repo artifacts / local generation:
`bpc-157-hero-spotlight.png`

Use it as visual reference while rebuilding the Figma slide. When the slide matches, re-run:

`Figma export → Save Figma Image → Buffer`

---

## After BPC-157
Duplicate the frame for other templates later:
- Mechanism Carousel
- 3-Bullet Benefits
- FAQ Slide
- TikTok Reel Frame (9:16)

Keep the same naming pattern so n8n can map `figma_template_type` → node id.
