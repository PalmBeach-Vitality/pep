# Store theme — homepage hero aspect ratio

Live site: [palmbeach-vitality.store](https://palmbeach-vitality.store)

| Breakpoint | Logo | Hero before | Hero after |
|-----------|------|-------------|------------|
| Mobile (`<750px`) | `2.35 / 1`, full width | `9 / 16`, max `22.5rem` | `2.35 / 1`, same width as logo |
| Desktop (`≥750px`) | `2.35 / 1`, max `64rem` | `9 / 16`, max `28rem` | `2.35 / 1`, same width as logo |

The WordPress theme (`palmbeach-vitality`) is hosted on WordPress.com Atomic and is **not** deployed from this repo. Apply the CSS on the live site:

## Apply (fastest)

1. WP Admin → **Appearance → Customize → Additional CSS**
2. Paste the **whole contents** of `additional-css-hero-match-logo.css` (not the filename)
3. Publish

## Apply (theme file)

Replace the hero block in `wp-content/themes/palmbeach-vitality/style.css` with the matching rules in `style.css` (search for `.pbv-hero-photo`), or upload the full `style.css` over the theme file via SFTP.

## Preview

Open `preview/index.html` locally to compare logo vs hero frames side by side.
