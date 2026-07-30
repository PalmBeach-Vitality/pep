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

Your live Additional CSS is still an **older paste** (logo/aspect only). The PEPTIDES title glow is not in it yet.

**Option A (recommended):** replace everything
1. WP Admin → **Appearance → Customize → Additional CSS**
2. Select all → delete
3. Paste the **whole contents** of `additional-css-hero-match-logo.css` (not the filename)
4. Publish

**Option B:** keep current CSS, only add titles
1. Scroll to the **bottom** of Additional CSS
2. Paste the **whole contents** of `additional-css-category-titles-only.css` (not the filename)
3. Publish

## Optional permanent theme file replace

Upload the **whole file** `assets/images/logo-full.jpg` over:

`wp-content/themes/palmbeach-vitality/assets/images/logo-full.jpg`

(via SFTP / File Manager). After that, you can remove the logo-swap lines from Additional CSS if you want.

## Preview

Open `preview/index.html` locally.
