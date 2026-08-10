# Palm Beach Pep — Character Lock (exact likeness)

## Goal
Pep must look **the same in every still** (A–D) and every scene. Prompt text alone is not enough.

## Method (required)
Use Grok **image edits** with a **canonical Pep master PNG** as `<IMAGE_0>` on every still call.

```text
POST https://api.x.ai/v1/images/edits
model: grok-imagine-image-quality
images[0] = pep_master_ref_url   ← always Pep
prompt    = place THIS exact character into the scene…
aspect_ratio: 9:16
resolution: 2k
```

### Beat references
| Beat | `images` array |
|---|---|
| A | `[pep_master]` |
| B | `[pep_master, still_a]` |
| C | `[pep_master, still_a]` |
| D | `[pep_master, still_a]` |

- `<IMAGE_0>` = Pep identity (never redesign)
- `<IMAGE_1>` (B–D) = scene continuity from still A (background/lighting family)

## Phase 0 — before any build smoke
1. Take the official Pep artwork (the vial mascot with molecular hat / thumbs-up).
2. Export a clean **PNG** (transparent or solid gray bg OK; full body visible).
3. Host it at a **stable public URL** (Shopify Files, S3, Drive public link that returns raw image, etc.).
4. Paste that URL into n8n Set field `pep_ref_url` on `prep_pep_breakdown`  
   **or** reply here with the URL and we’ll hardcode it into the prep node.

**Do not** regenerate Pep from text each run. One master file → every scene.

## Likeness rules (prompt must say)
- Preserve exact face, eyes, smile, cheeks, `10ml` label typography
- Preserve white molecular baseball cap pattern
- Preserve silver crimp cap, clear glass, liquid level
- Preserve gray limbs, white gloves, white sneakers
- Preserve sticker/clip-art line weight and colors
- Only change: pose micro-adjustment + background/environment
- Forbidden: redesign, new outfit, different vial cap, humanization, style drift

## QC gate
Before animating video: Sal checks stills A–D. If Pep drifts, regenerate that still only — do not continue.
