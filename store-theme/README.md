# Store theme — homepage logo + hero

Live site: [palmbeach-vitality.store](https://palmbeach-vitality.store)

## Logo

| | |
|--|--|
| **New logo (whole file)** | `store-theme/assets/images/PBV_NEW_LOGO.jpg` |
| **Also saved as** | `store-theme/assets/images/logo-full.jpg` |
| **Live media URL** | https://palmbeach-vitality.store/wp-content/uploads/2026/07/PBV_NEW_LOGO.jpg |

## Aspect ratio

| Breakpoint | Logo + hero |
|-----------|-------------|
| Mobile (`<750px`) | `2.35 / 1`, same width |
| Desktop (`≥750px`) | `2.35 / 1`, same width |

## Apply (fastest) — Additional CSS

1. WP Admin → **Appearance → Customize → Additional CSS**
2. Paste the **whole contents** of `additional-css-hero-match-logo.css` (not the filename)
3. Publish

That CSS:
- Swaps in the new logo URL
- Matches hero aspect ratio on desktop + mobile
- Centers **PEPTIDES** on the category page with an electric blue energy glow (like the vial product shots)

## Optional permanent theme file replace

Upload the **whole file** `assets/images/logo-full.jpg` over:

`wp-content/themes/palmbeach-vitality/assets/images/logo-full.jpg`

(via SFTP / File Manager). After that, you can remove the logo-swap lines from Additional CSS if you want.

## Preview

Open `preview/index.html` locally.
