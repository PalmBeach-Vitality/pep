# Store theme — homepage hero aspect ratio

Live site: [palmbeach-vitality.store](https://palmbeach-vitality.store)

| Element | Before | After |
|--------|--------|-------|
| Logo (`.pbv-logo-card`) | `2.35 / 1` | unchanged |
| Hero (`.pbv-hero-photo`) | `9 / 16` | `2.35 / 1` (matches logo width + radius) |

The WordPress theme (`palmbeach-vitality`) is hosted on WordPress.com Atomic and is **not** deployed from this repo. Apply the CSS on the live site:

## Apply (fastest)

1. WP Admin → **Appearance → Customize → Additional CSS**
2. Paste the contents of `additional-css-hero-match-logo.css`
3. Publish

## Apply (theme file)

Replace the hero block in `wp-content/themes/palmbeach-vitality/style.css` with the matching rules in `style.css` (search for `.pbv-hero-photo`), or upload the full `style.css` over the theme file via SFTP.

## Preview

Open `preview/index.html` locally to compare logo vs hero frames side by side.
