# Shopify → WooCommerce migration (Palm Beach Vitality)

Store: `palmbeach-vitality.store`  
Current: Shopify (recently returning restricted/429 responses)  
Target: WordPress + WooCommerce on a normal host

> Keep FDA positioning: laboratory research materials only, not for human use/consumption. No disease/structure-function claim language on product pages.

---

## Phase 1 — Hosting (do this first)

You need WordPress hosting that allows WooCommerce:

Good starter options:
- SiteGround / Cloudways / WP Engine / Rocket.net / Hostinger Woo plan
- Or VPS (DigitalOcean) if you want full control

Install:
1. WordPress
2. WooCommerce plugin
3. SSL (HTTPS)
4. Permalink structure: **Shop base** matching old URLs if possible

### Permalink goal
Old Shopify URLs look like:
`/products/bpc-157-pen`

WooCommerce default is often:
`/product/bpc-157-pen`

For fewer broken links (n8n sheets + SEO), either:
- Set product permalink base to `products` (closest match), or
- Add redirects from `/products/slug` → `/product/slug`

---

## Phase 2 — Export from Shopify

In Shopify admin (while you still can):

1. **Products** → Export → All products → CSV  
2. **Customers** → Export (optional)  
3. Download product images (or use Shopify CDN URLs temporarily)  
4. Save theme content you care about (About, policies, shipping)

If admin is locked, use whatever CSV/images you already have + the cleaned catalog in this repo once merged from the marketing branch (`marketing/sheets/`).

---

## Phase 3 — Import into WooCommerce

1. WooCommerce → Products → **Import**
2. Use `woocommerce-products-import-template.csv` (in this folder) as the map
3. Map columns:
   - Name → product name (chemical names only)
   - SKU → compound/SKU id
   - Regular price
   - Description / Short description (research-only copy)
   - Images
   - Categories
4. Import in batches if catalog is large

### FDA copy rules for every product
Short description / description must include:
```text
For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.
```

Use chemical names only (no KLOW / Wolverine / GLOW nicknames on titles).

---

## Phase 4 — Pages & design

Recreate essential pages:
- Home
- Shop / catalog
- About
- Contact
- Shipping / Refund / Privacy / Terms
- Research-use disclaimer page (recommended)

Theme: pick a clean Woo theme (Blocksy, Kadence, GeneratePress) — keep clinical/lab look, navy + teal.

---

## Phase 5 — Payments & ops

- Stripe / PayPal (Woo extensions)
- Tax settings
- Shipping zones
- Email notifications
- Admin users

---

## Phase 6 — Domain cutover

1. Test on temporary URL first (`yoursite.wpengine.com` etc.)
2. When ready:
   - Point `palmbeach-vitality.store` DNS A/CNAME to new host
   - Force HTTPS
3. Add redirects for old Shopify product URLs
4. Update n8n spreadsheet `canonical_url` values to final Woo URLs

---

## Phase 7 — n8n / marketing after cutover

Update:
- `1-compounds-pens` / vials `canonical_url` columns
- Any Buffer captions with old links
- Confirm each Active URL resolves on Woo

---

## Immediate next actions for you
1. Choose hosting + install WordPress/WooCommerce  
2. Tell me the host/temp URL  
3. Export Shopify products CSV if still accessible  
4. We’ll import products with compliant titles/descriptions  

If Shopify admin is fully locked, we’ll rebuild the catalog from your existing product list/sheets into WooCommerce import CSVs.
