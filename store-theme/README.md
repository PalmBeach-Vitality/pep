# Store theme — homepage logo + Peptides title image

Live site: [palmbeach-vitality.store](https://palmbeach-vitality.store)

**Branch:** `cursor/homepage-hero-aspect-ratio-7786`  
**PR:** https://github.com/PalmBeach-Vitality/pep/pull/5

## Assets (whole files)

| File | Purpose |
|------|---------|
| `assets/images/PBV_NEW_LOGO.jpg` | New homepage logo |
| `assets/images/logo-full.jpg` | Same logo, theme filename |
| `assets/images/Peptides-glow.png` | Peptides category title art |
| `assets/images/Peptide-Pens-glow.png` | Peptide Pens category title art |

## Apply on live WP

1. Open PR #5 on branch `cursor/homepage-hero-aspect-ratio-7786`
2. Open `store-theme/additional-css-hero-match-logo.css`
3. Copy the **whole contents** of that file (not the filename)
4. WP Admin → **Appearance → Customize → Additional CSS**
5. Select all → delete → paste → **Publish**
6. Hard refresh `/product-category/peptides/`

That CSS:
- Swaps homepage logo to `PBV_NEW_LOGO.jpg`
- Matches logo + hero to `2.35:1`
- Replaces Peptides + Peptide Pens page titles with centered glow images
- Removes the old CSS text-glow

## Titles-only shortcut

If you only want the Peptides image title: paste the **whole contents** of `additional-css-category-titles-only.css` at the bottom of Additional CSS (or replace the old glow block with it).
