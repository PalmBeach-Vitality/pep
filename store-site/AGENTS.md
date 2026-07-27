# Palm Beach Vitality (Store)

A fully static, multi-page website (HTML + Tailwind CSS via CDN + a little vanilla JS) for the `www.palmbeach-vitality.store` domain. Intended to live in its own repository and deploy via GitHub Pages (see `CNAME`).

## Cursor Cloud specific instructions

- This is a **pure static site**. There is no build step, no package manager, no `package.json`, and no dependencies to install. Tailwind is loaded from a CDN at runtime.
- There are **no lint, test, or build commands**. Do not look for them.
- Pages live in per-route folders as `index.html` (e.g. `products/index.html`, `contact/index.html`) plus article pages under `research/`.
- To run it in development, serve this directory over HTTP (relative links behave best over HTTP):
  - `python3 -m http.server 8000` from this directory, then browse `http://localhost:8000/`.
- Interactive behavior is plain vanilla JS embedded in each page: the mobile menu toggle and the product category filter on `products/index.html` (filter buttons use `data-filter` matched against each card's `data-category`).
- Editing any `.html` file takes effect on a simple browser refresh — there is no hot-reload/watch process.
